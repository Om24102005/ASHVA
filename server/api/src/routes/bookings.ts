/** Bookings — create against a real asset (server computes the fare), list own.
 *  When a booking is created the asset flips to 'booked' and we publish an
 *  'asset' event so other user panels see it disappear in real time. */
import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool, query } from '../db.js';
import { asyncHandler, bad, notFound } from '../http.js';
import { requireAuth } from '../auth/middleware.js';
import { emit } from '../bus.js';

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

const INSURANCE_PER_DAY = 199;
const HUB_HANDLING = 299;

// Server-authoritative gear prices — never accepted from the client.
const GEAR_PRICES: Record<string, number> = {
  cam: 400,
  jkt: 350,
  comm: 250,
  boot: 300,
  bag: 200,
  glove: 150,
};

function mapBooking(r: Record<string, unknown>): unknown {
  return {
    id: r.id,
    reference: r.reference,
    assetId: r.asset_id,
    asset: r.asset_name
      ? {
          id: r.asset_id,
          slug: r.asset_slug,
          name: r.asset_name,
          maker: r.asset_maker,
          pricePerDay: Number(r.asset_price),
          specs: r.asset_specs ?? {},
        }
      : undefined,
    status: r.status,
    hub: r.hub,
    startTs: new Date(r.start_ts as string).toISOString(),
    endTs: new Date(r.end_ts as string).toISOString(),
    days: r.days,
    gear: r.gear ?? [],
    totalAmount: Number(r.total_amount),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

/** Map a raw `assets` row to the public snapshot shape. Mirrors the helper
 *  in routes/admin.ts so admins and users always see identical payloads. */
function assetSnapshot(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row['id'],
    slug: row['slug'],
    name: row['name'],
    maker: row['maker'],
    type: row['type'],
    status: row['status'],
    pricePerDay: row['price_per_day'] != null ? Number(row['price_per_day']) : null,
    rating: row['rating'] != null ? Number(row['rating']) : null,
    specs: row['specs'] ?? {},
    photoUrl: row['photo_url'] ?? null,
  };
}

const SELECT = `
  SELECT b.*, a.slug AS asset_slug, a.name AS asset_name, a.maker AS asset_maker,
         a.price_per_day AS asset_price, a.specs AS asset_specs
    FROM bookings b JOIN assets a ON a.id = b.asset_id
`;

bookingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`${SELECT} WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [req.auth!.sub]);
    res.json({ bookings: rows.map(mapBooking) });
  }),
);

bookingsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    // Accept gear id+name only; price is always looked up server-side.
    const { assetId, days, hub, gear } = z
      .object({
        assetId: z.string().uuid(),
        days: z.number().int().min(1).max(60),
        hub: z.string().optional().default('Manali'),
        gear: z.array(z.object({ id: z.string(), name: z.string() })).optional().default([]),
      })
      .parse(req.body);

    const client = await pool.connect();
    let updatedAsset: Record<string, unknown> | null = null;
    try {
      await client.query('BEGIN');

      // Lock the asset row to prevent concurrent double-bookings.
      const assetRes = await client.query('SELECT * FROM assets WHERE id = $1 FOR UPDATE', [assetId]);
      const asset = assetRes.rows[0];
      if (!asset) throw notFound('Asset not found.');
      if (asset.status !== 'available') throw bad('That asset is not available right now.');

      // Resolve gear prices server-side; skip unknown gear IDs.
      const resolvedGear = gear
        .filter(g => GEAR_PRICES[g.id] !== undefined)
        .map(g => ({ id: g.id, name: g.name, pricePerDay: GEAR_PRICES[g.id]! }));
      const gearPerDay = resolvedGear.reduce((s, g) => s + g.pricePerDay, 0);
      const total = (Number(asset.price_per_day) + INSURANCE_PER_DAY + gearPerDay) * days + HUB_HANDLING;

      // Collision-resistant reference: ASH- + 8 random hex chars (~4 billion space).
      const ref = 'ASH-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const start = new Date();
      const end = new Date(Date.now() + days * 86400000);
      const geofence = asset.latitude != null
        ? { center: { latitude: Number(asset.latitude), longitude: Number(asset.longitude) }, radiusM: 500 }
        : {};

      const ins = await client.query(
        `INSERT INTO bookings (reference, user_id, asset_id, status, hub, start_ts, end_ts, days, gear, total_amount, geofence)
         VALUES ($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [ref, req.auth!.sub, assetId, hub, start.toISOString(), end.toISOString(), days, JSON.stringify(resolvedGear), total, JSON.stringify(geofence)],
      );

      // Mark asset unavailable so subsequent requests see the correct status.
      const upd = await client.query(
        `UPDATE assets SET status = 'booked' WHERE id = $1 RETURNING *`,
        [assetId],
      );
      updatedAsset = upd.rows[0] as Record<string, unknown>;

      await client.query('COMMIT');

      const { rows } = await query(`${SELECT} WHERE b.id = $1`, [ins.rows[0]!.id]);
      res.json({ booking: mapBooking(rows[0]!) });
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {});
      throw e;
    } finally {
      client.release();
      // Emit AFTER the client is released so a slow subscriber can't block the DB.
      if (updatedAsset) {
        emit('asset', { kind: 'update', asset: assetSnapshot(updatedAsset) });
      }
    }
  }),
);