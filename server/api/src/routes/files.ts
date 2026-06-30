/** Photo proxy route — serves MinIO/S3 objects through the API.
 *
 * Why this exists
 * ---------------
 * `S3_PUBLIC_URL` in the dev .env points at a LAN address
 * (e.g. http://192.168.1.15:9000) so the developer's iPhone on the
 * same WiFi can preview uploads. That URL is unreachable from outside
 * the LAN — a real user on 4G gets a connection-refused, the image
 * silently breaks, and the hero is left with an empty dark slab.
 *
 * The proxy sidesteps the problem by making the API the single source
 * of truth for image delivery. The client just loads
 *   <API_ORIGIN>/files/<bucket>/<key>
 * and the API fetches the bytes from MinIO and streams them back. No
 * CORS, no LAN-IP issues, no 3rd-party CDN config required. When
 * `S3_PUBLIC_URL` is later set to a real CDN, the URL is still served
 * fine (the proxy just becomes one more valid way to fetch the same
 * bytes).
 *
 * Public: no auth required, since the URLs themselves act as a
 * capability (you can only get to a file if you know its key). For
 * sensitive buckets (e.g. KYC) the admin should add a signed-URL
 * wrapper; for the bike-photos bucket this is overkill.
 */
import { Router } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, s3Enabled } from '../providers/storage.js';
import type { Request, Response } from 'express';

export const filesRouter = Router();

/** Map a file extension to a Content-Type. Falls back to
 *  application/octet-stream for anything unknown. */
function contentTypeFromKey(key: string): string {
  const ext = key.toLowerCase().split('.').pop() || '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'avif') return 'image/avif';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  if (ext === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
}

/** Strip a leading slash from a wildcard param. Express captures the
 *  rest of the path *with* the leading slash; the S3 key doesn't
 *  include it. */
function normalizeKey(raw: string): string {
  let k = raw || '';
  if (k.startsWith('/')) k = k.slice(1);
  return k;
}

filesRouter.get(
  '/files/:bucket/*',
  async (req: Request, res: Response): Promise<void> => {
    if (!s3Enabled || !s3Client) {
      res.status(503).json({ message: 'Storage not configured.' });
      return;
    }
    const bucket = String(req.params['bucket'] || '');
    const key = normalizeKey(String((req.params as Record<string, string>)[0] || ''));
    if (!bucket || !key) {
      res.status(400).json({ message: 'Bucket and key required.' });
      return;
    }
    // Defence in depth: never let a caller escape the configured bucket
    // namespace by smuggling a `../` segment or an absolute path.
    if (key.includes('..') || key.startsWith('/')) {
      res.status(400).json({ message: 'Invalid key.' });
      return;
    }

    try {
      const out = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      if (!out.Body) { res.status(404).json({ message: 'Not found.' }); return; }

      const ct = out.ContentType || contentTypeFromKey(key);
      res.setHeader('Content-Type', ct);
      if (out.ContentLength != null) res.setHeader('Content-Length', String(out.ContentLength));
      // 1-day browser cache — bikes don't change photos every minute,
      // and the SSE bus pushes an immediate refresh on real updates.
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // S3 Body is a Node Readable in this runtime; pipe straight through.
      const body = out.Body as unknown as NodeJS.ReadableStream;
      body.on('error', () => { try { res.end(); } catch { /* socket closed */ } });
      body.pipe(res);
    } catch (e) {
      const status = (e as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
      if (status === 404) { res.status(404).json({ message: 'Not found.' }); return; }
      // 403 / 5xx / network — surface as 502 so the client knows it's
      // a transient server-side issue, not a permanently-missing file.
      res.status(502).json({
        message: 'Storage fetch failed.',
        detail: e instanceof Error ? e.message : 'unknown',
      });
    }
  },
);
