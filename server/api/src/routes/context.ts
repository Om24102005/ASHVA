/** Context — the ASHVA fleet (assets). */
import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler } from '../http.js';
import { requireAuth } from '../auth/middleware.js';

export const contextRouter = Router();
contextRouter.use(requireAuth);

contextRouter.get(
  '/assets',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`SELECT * FROM assets WHERE status != 'retired' ORDER BY price_per_day ASC`);
    res.json({
      assets: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        maker: r.maker,
        type: r.type,
        status: r.status,
        pricePerDay: Number(r.price_per_day),
        rating: r.rating != null ? Number(r.rating) : null,
        specs: r.specs ?? {},
        photoUrl: r.photo_url ?? null,
      })),
    });
  }),
);
