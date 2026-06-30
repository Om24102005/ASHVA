/** ASHVA API entrypoint — Express. */
import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { waitForDb } from './db.js';
import { ensureSchema, runMigrations } from './migrate.js';
import { errorMiddleware, asyncHandler, unauthorized } from './http.js';
import { requireAuth } from './auth/middleware.js';
import { getUserProfile } from './repo.js';
import { authRouter } from './routes/auth.js';
import { contactRouter } from './routes/contact.js';
import { kycRouter } from './routes/kyc.js';
import { bookingsRouter } from './routes/bookings.js';
import { contextRouter } from './routes/context.js';
import { adminRouter } from './routes/admin.js';
import { streamRouter } from './routes/stream.js';
import { filesRouter } from './routes/files.js';
import { ensureBucket } from './providers/storage.js';

async function main(): Promise<void> {
  await waitForDb();
  await ensureSchema();
  await runMigrations();
  await ensureBucket();

  const app = express();
  // In production, set CORS_ORIGIN to a comma-separated list of allowed origins.
  // Default (empty) allows all origins for local dev / Render previews.
  const allowedOrigins = (process.env['CORS_ORIGIN'] || '').split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors(allowedOrigins.length ? {
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    credentials: true,
  } : undefined));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
  app.get(
    '/me',
    requireAuth,
    asyncHandler(async (req, res) => {
      const user = await getUserProfile(req.auth!.sub);
      if (!user) throw unauthorized('Account not found.');
      res.json({ user });
    }),
  );

  app.use('/auth', authRouter);
  app.use('/contact', contactRouter);
  app.use('/kyc', kycRouter);
  app.use('/bookings', bookingsRouter);
  app.use('/context', contextRouter);
  app.use('/admin', adminRouter);
  // /stream lives under /context so the real-time fleet feed sits next to the
  // REST fleet endpoint. Version + SSE both require auth (Bearer header or
  // ?token= for EventSource).
  app.use('/context', streamRouter);
  // Public photo proxy — see ./routes/files.ts. Mounted at the root so
  // the URLs it serves (/files/<bucket>/<key>) work from anywhere
  // regardless of the storage backend's network location.
  app.use(filesRouter);

  app.use(errorMiddleware);

  app.listen(env.port, () => console.log(`[api] ASHVA listening on :${env.port}`));
}

main().catch((e) => {
  console.error('[api] fatal startup error:', e instanceof Error ? e.message : e);
  process.exit(1);
});
