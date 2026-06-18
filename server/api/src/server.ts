/** ASHVA API entrypoint — Express. */
import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { waitForDb } from './db.js';
import { ensureSchema } from './migrate.js';
import { errorMiddleware, asyncHandler, unauthorized } from './http.js';
import { requireAuth } from './auth/middleware.js';
import { getUserProfile } from './repo.js';
import { authRouter } from './routes/auth.js';
import { contactRouter } from './routes/contact.js';
import { kycRouter } from './routes/kyc.js';
import { bookingsRouter } from './routes/bookings.js';
import { contextRouter } from './routes/context.js';
import { ensureBucket } from './providers/storage.js';

async function main(): Promise<void> {
  await waitForDb();
  await ensureSchema();
  await ensureBucket();

  const app = express();
  app.use(cors());
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

  app.use(errorMiddleware);

  app.listen(env.port, () => console.log(`[api] ASHVA listening on :${env.port}`));
}

main().catch((e) => {
  console.error('[api] fatal startup error:', e instanceof Error ? e.message : e);
  process.exit(1);
});
