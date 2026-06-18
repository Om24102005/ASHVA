/** Bookings — create against a real asset (server computes the fare), list own. */
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, bad, notFound } from '../http.js';
import { requireAuth } from '../auth/middleware.js';

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

const INSURANCE_PER_DAY = 199;
const HUB_HANDLING = 299;

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
    const { assetId, days, hub, gear } = z
      .object({
        assetId: z.string().uuid(),
        days: z.number().int().min(1).max(60),
        hub: z.string().optional().default('Manali'),
        gear: z.array(z.object({ id: z.string(), name: z.string(), pricePerDay: z.number() })).optional().default([]),
      })
      .parse(req.body);

    const assetRes = await query('SELECT * FROM assets WHERE id = $1', [assetId]);
    const asset = assetRes.rows[0];
    if (!asset) throw notFound('Asset not found.');
    if (asset.status !== 'available') throw bad('That asset is not available right now.');

    const gearPerDay = gear.reduce((s, g) => s + g.pricePerDay, 0);
    const total = (Number(asset.price_per_day) + INSURANCE_PER_DAY + gearPerDay) * days + HUB_HANDLING;
    const ref = 'ASH-' + Math.floor(1000 + Math.random() * 9000);
    const start = new Date();
    const end = new Date(Date.now() + days * 86400000);
    const geofence = asset.latitude != null ? { center: { latitude: Number(asset.latitude), longitude: Number(asset.longitude) }, radiusM: 500 } : {};

    const ins = await query(
      `INSERT INTO bookings (reference, user_id, asset_id, status, hub, start_ts, end_ts, days, gear, total_amount, geofence)
       VALUES ($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [ref, req.auth!.sub, assetId, hub, start.toISOString(), end.toISOString(), days, JSON.stringify(gear), total, JSON.stringify(geofence)],
    );
    const { rows } = await query(`${SELECT} WHERE b.id = $1`, [ins.rows[0]!.id]);
    res.json({ booking: mapBooking(rows[0]!) });
  }),
);
