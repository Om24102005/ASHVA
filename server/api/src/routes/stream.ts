/** SSE stream + version endpoint. Pushes real-time fleet updates to user panels
 *  so an admin "Set Offline" toggle is reflected instantly without a refresh.
 *  Falls back to a polling-friendly version counter when SSE is blocked.
 *
 *  Auth: EventSource cannot set custom headers, so the JWT is accepted via
 *  `?token=…` query param for GET /stream and via Bearer for /version.
 */
import { Router, type Request, type Response } from 'express';
import { verifyToken } from '../auth/jwt.js';
import { asyncHandler, unauthorized } from '../http.js';
import { subscribe, unsubscribe, currentVersion } from '../bus.js';

export const streamRouter = Router();

const HEARTBEAT_MS = 25_000;

function sseHeaders(res: Response): void {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  // Flush headers immediately so the browser knows the stream is open.
  (res as unknown as { flushHeaders?: () => void }).flushHeaders?.();
}

streamRouter.get(
  '/assets/version',
  asyncHandler(async (_req, res) => {
    res.json({ version: currentVersion() });
  }),
);

streamRouter.get(
  '/assets/stream',
  asyncHandler(async (req, res) => {
    // Token can come from the Authorization header (BFF / curl) or ?token= (browser SSE).
    const headerTok = (req.headers.authorization ?? '').startsWith('Bearer ')
      ? req.headers.authorization!.slice(7)
      : '';
    const token = headerTok || (typeof req.query['token'] === 'string' ? req.query['token'] : '');
    const claims = token ? verifyToken(token) : null;
    if (!claims) throw unauthorized('Sign in to subscribe.');
    if (claims.role !== 'user') throw unauthorized('User stream only.');

    sseHeaders(res);

    // Send a hello frame so EventSource fires `open` right away and clients
    // know they're authenticated.
    res.write(`event: hello\ndata: ${JSON.stringify({ version: currentVersion() })}\n\n`);

    subscribe(res, claims.sub);

    // Heartbeat — keeps proxies (Render, nginx, corporate) from killing the
    // connection on idle and helps detect dead sockets early.
    const beat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(beat);
        unsubscribe(res);
      }
    }, HEARTBEAT_MS);
    res.on('close', () => {
      clearInterval(beat);
      unsubscribe(res);
    });
  }),
);

// Silence unused-arg lint while keeping the signature typed.
export type StreamReq = Request;