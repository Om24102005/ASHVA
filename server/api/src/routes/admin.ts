/** Admin routes — fleet management, bookings, users, KYC. Admin-JWT gated. */
import crypto from 'crypto';
import multer from 'multer';
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, unauthorized, bad, notFound } from '../http.js';
import { signToken, verifyToken } from '../auth/jwt.js';
import { uploadObject } from '../providers/storage.js';
import { env } from '../env.js';
import type { Request, Response, NextFunction } from 'express';

const uploadMW = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const adminRouter = Router();

function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const claims = token ? verifyToken(token) : null;
  if (!claims || claims.role !== 'admin') {
    next(unauthorized('Admin access required.'));
    return;
  }
  req.auth = claims;
  next();
}

/* ── auth ─────────────────────────────────────────────────── */
adminRouter.post(
  '/auth',
  asyncHandler(async (req, res) => {
    const { email, password } = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(req.body);

    if (!env.adminEmail || !env.adminPassword) throw unauthorized('Admin access not configured.');

    const ae = Buffer.from(env.adminEmail.toLowerCase());
    const ie = Buffer.from(email.toLowerCase());
    const ap = Buffer.from(env.adminPassword);
    const ip = Buffer.from(password);

    const emailOk = ae.length === ie.length && crypto.timingSafeEqual(ae, ie);
    // pad to same length before timingSafeEqual to avoid length-timing leak
    const maxLen = Math.max(ap.length, ip.length);
    const aPad = Buffer.concat([ap, Buffer.alloc(maxLen - ap.length)]);
    const iPad = Buffer.concat([ip, Buffer.alloc(maxLen - ip.length)]);
    const passOk = ap.length === ip.length && crypto.timingSafeEqual(aPad, iPad);

    if (!emailOk || !passOk) throw unauthorized('Invalid admin credentials.');

    const token = signToken('__admin__', 'admin');
    res.json({ ok: true, data: { token, role: 'admin' } });
  }),
);

/* ── stats ────────────────────────────────────────────────── */
adminRouter.get(
  '/stats',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [users, bookings, revenue, kyc, assets] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query("SELECT COUNT(*) FROM bookings WHERE status != 'cancelled'"),
      query("SELECT COALESCE(SUM(total_amount),0) AS total FROM bookings WHERE status NOT IN ('cancelled')"),
      query("SELECT COUNT(*) FROM kyc_records WHERE status IN ('pending','in_review')"),
      query("SELECT COUNT(*) FILTER (WHERE status='available') AS avail, COUNT(*) AS total FROM assets WHERE status != 'retired'"),
    ]);
    res.json({
      users: Number(users.rows[0]?.count ?? 0),
      bookings: Number(bookings.rows[0]?.count ?? 0),
      revenue: Number(revenue.rows[0]?.total ?? 0),
      kycPending: Number(kyc.rows[0]?.count ?? 0),
      assetsAvail: Number(assets.rows[0]?.avail ?? 0),
      assetsTotal: Number(assets.rows[0]?.total ?? 0),
    });
  }),
);

/* ── fleet ────────────────────────────────────────────────── */
adminRouter.get(
  '/fleet',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      "SELECT id,slug,name,maker,type,status,price_per_day,rating,specs,photo_url,created_at FROM assets WHERE status != 'retired' ORDER BY created_at ASC",
    );
    res.json({ assets: rows });
  }),
);

adminRouter.post(
  '/fleet/upload-photo',
  requireAdmin,
  uploadMW.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw bad('No photo file.');
    const ext = (req.file.mimetype.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const key = `bikes/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const url = await uploadObject(key, req.file.buffer, req.file.mimetype);
    res.json({ ok: true, data: { url } });
  }),
);

adminRouter.patch(
  '/fleet/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        status: z.enum(['available', 'maintenance', 'retired']).optional(),
        name: z.string().min(1).optional(),
        pricePerDay: z.number().min(0).optional(),
        rating: z.number().min(0).max(5).optional(),
      })
      .parse(req.body);

    const fields: string[] = [];
    const vals: unknown[] = [];
    const push = (expr: string, v: unknown) => { fields.push(`${expr} = $${vals.push(v)}`); };

    if (body.status !== undefined) push('status', body.status);
    if (body.name !== undefined) push('name', body.name);
    if (body.pricePerDay !== undefined) push('price_per_day', body.pricePerDay);
    if (body.rating !== undefined) push('rating', body.rating);
    if (!fields.length) throw bad('Nothing to update.');

    vals.push(req.params['id']);
    const { rows } = await query(
      `UPDATE assets SET ${fields.join(', ')} WHERE id = $${vals.length} AND status != 'retired' RETURNING *`,
      vals,
    );
    if (!rows[0]) throw notFound('Asset not found.');
    res.json({ asset: rows[0] });
  }),
);

adminRouter.post(
  '/fleet',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const b = z
      .object({
        name: z.string().min(1),
        maker: z.string().min(1),
        pricePerDay: z.number().min(0),
        engine: z.string().default(''),
        power: z.string().default(''),
        range: z.string().default(''),
        torque: z.string().default(''),
        topSpeed: z.string().default(''),
        weight: z.string().default(''),
        kicker: z.string().default(''),
        about: z.string().default(''),
        features: z.array(z.string()).default([]),
        photoUrl: z.string().default(''),
        type: z.enum(['motorcycle', 'scooter', 'gear']).default('motorcycle'),
      })
      .parse(req.body);

    const slug =
      b.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 24) +
      '-' +
      Date.now().toString(36);

    const specs = {
      kicker: b.kicker, engine: b.engine, power: b.power, range: b.range,
      torque: b.torque, topSpeed: b.topSpeed, weight: b.weight,
      about: b.about, features: b.features,
    };
    const { rows } = await query(
      `INSERT INTO assets (slug, name, maker, type, price_per_day, specs, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [slug, b.name, b.maker, b.type, b.pricePerDay, JSON.stringify(specs), b.photoUrl || null],
    );
    res.json({ asset: rows[0] });
  }),
);

/* ── bookings ─────────────────────────────────────────────── */
adminRouter.get(
  '/bookings',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT b.id, b.reference, b.status, b.hub, b.start_ts, b.end_ts, b.days,
             b.total_amount, b.created_at,
             a.name AS asset_name, a.maker AS asset_maker, a.slug AS asset_slug,
             u.display_name, c.email AS user_email, c.phone AS user_phone
        FROM bookings b
        JOIN assets a ON a.id = b.asset_id
        JOIN users u ON u.id = b.user_id
        LEFT JOIN contact_info c ON c.user_id = b.user_id
       ORDER BY b.created_at DESC
       LIMIT 300
    `);
    res.json({ bookings: rows });
  }),
);

adminRouter.patch(
  '/bookings/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(['confirmed', 'active', 'completed', 'cancelled']) })
      .parse(req.body);
    const { rows } = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *, asset_id`,
      [status, req.params['id']],
    );
    if (!rows[0]) throw notFound('Booking not found.');
    if (['completed', 'cancelled'].includes(status)) {
      await query(`UPDATE assets SET status = 'available' WHERE id = $1 AND status = 'booked'`, [rows[0].asset_id]);
    }
    res.json({ booking: rows[0] });
  }),
);

/* ── users ────────────────────────────────────────────────── */
adminRouter.get(
  '/users',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT u.id, u.display_name, u.role, u.status, u.created_at, u.last_login_at,
             c.email, c.phone,
             COUNT(b.id) AS booking_count
        FROM users u
        LEFT JOIN contact_info c ON c.user_id = u.id
        LEFT JOIN bookings b ON b.user_id = u.id
       GROUP BY u.id, c.email, c.phone
       ORDER BY u.created_at DESC
       LIMIT 500
    `);
    res.json({ users: rows });
  }),
);

adminRouter.patch(
  '/users/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(['active', 'suspended']) }).parse(req.body);
    const { rows } = await query(
      `UPDATE users SET status = $1 WHERE id = $2 AND role != 'admin' RETURNING id, display_name, status`,
      [status, req.params['id']],
    );
    if (!rows[0]) throw notFound('User not found.');
    res.json({ user: rows[0] });
  }),
);

/* ── kyc ──────────────────────────────────────────────────── */
adminRouter.get(
  '/kyc',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT k.id, k.user_id, k.doc_type, k.id_number, k.full_name, k.status,
             k.submitted_at, k.review_notes,
             u.display_name, c.email, c.phone,
             json_agg(
               json_build_object('label', d.page_label, 'url', d.storage_url)
               ORDER BY d.created_at
             ) FILTER (WHERE d.id IS NOT NULL) AS documents
        FROM kyc_records k
        JOIN users u ON u.id = k.user_id
        LEFT JOIN contact_info c ON c.user_id = k.user_id
        LEFT JOIN kyc_documents d ON d.kyc_id = k.id
       WHERE k.status IN ('pending', 'in_review')
       GROUP BY k.id, u.display_name, c.email, c.phone
       ORDER BY k.submitted_at ASC
    `);
    res.json({ records: rows });
  }),
);

adminRouter.patch(
  '/kyc/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, notes } = z
      .object({
        status: z.enum(['approved', 'rejected', 'in_review']),
        notes: z.string().optional(),
      })
      .parse(req.body);
    const { rows } = await query(
      `UPDATE kyc_records SET status = $1, review_notes = $2, reviewed_at = now()
         WHERE id = $3 RETURNING id, user_id, status, review_notes`,
      [status, notes ?? null, req.params['id']],
    );
    if (!rows[0]) throw notFound('KYC record not found.');
    res.json({ record: rows[0] });
  }),
);
