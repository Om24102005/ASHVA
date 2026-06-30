/** S3-compatible storage (MinIO). Uploads KYC docs, returns a public URL.
 *  The S3 client is also exported so the /files proxy route can fetch
 *  objects back out. */
import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { env } from '../env.js';
import { ApiError } from '../http.js';
import type { Request } from 'express';

export const s3Enabled = !!(env.s3.accessKey && env.s3.secretKey);

export const s3Client: S3Client | null = s3Enabled ? new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  forcePathStyle: true,
  credentials: { accessKeyId: env.s3.accessKey, secretAccessKey: env.s3.secretKey },
}) : null;

export async function ensureBucket(): Promise<void> {
  if (!s3Enabled || !s3Client) { console.warn('[storage] S3 not configured — KYC uploads disabled.'); return; }
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.s3.bucket }));
  } catch (e: unknown) {
    const status = (e as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    if (status === 404 || status === undefined) {
      // Bucket doesn't exist — try to create it.
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: env.s3.bucket }));
      } catch (ce) {
        console.warn('[storage] could not create bucket:', ce instanceof Error ? ce.message : ce);
      }
    } else {
      // 403 / 5xx — real error; log loudly rather than silently ignoring it.
      console.error('[storage] HeadBucket failed (status', status, '):', e instanceof Error ? e.message : e);
    }
  }
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!s3Enabled || !s3Client) throw new ApiError(503, 'STORAGE_DISABLED', 'KYC storage not configured.');
  try {
    await s3Client.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: body, ContentType: contentType }));
    return `${env.s3.publicUrl.replace(/\/$/, '')}/${env.s3.bucket}/${key}`;
  } catch (e) {
    throw new ApiError(502, 'UPLOAD_FAILED', `Storage upload failed: ${e instanceof Error ? e.message : 'unknown'}`);
  }
}

/** True if the URL points at a network the public can't reach — RFC1918
 *  LAN ranges, loopback, link-local, and *.local mDNS. When the admin
 *  leaves `S3_PUBLIC_URL` at the dev default of `http://192.168.1.15:9000`,
 *  this returns true, and we rewrite the URL through the /files proxy
 *  so a real iPhone on 4G can still load the photo. */
export function isPrivateNetworkUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  let host = '';
  try {
    const u = new URL(url);
    host = u.hostname.toLowerCase();
  } catch { return false; }
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0') return true;
  if (host.endsWith('.local') || host.endsWith('.lan') || host.endsWith('.internal')) return true;
  // 10.0.0.0/8
  if (/^10\./.test(host)) return true;
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  // 192.168.0.0/16
  if (/^192\.168\./.test(host)) return true;
  // 169.254.0.0/16 link-local
  if (/^169\.254\./.test(host)) return true;
  return false;
}

/** Extract the bucket and key from a MinIO-style URL like
 *  `http://192.168.1.15:9000/kyc/bikes/foo.jpg`. Returns null if the
 *  URL doesn't look like one of ours. */
export function splitStorageUrl(url: string): { bucket: string; key: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Path looks like /<bucket>/<key...> — strip the leading slash.
    const parts = u.pathname.replace(/^\//, '').split('/');
    if (parts.length < 2) return null;
    const bucket = parts[0]!;
    const key = parts.slice(1).join('/');
    return { bucket, key };
  } catch { return null; }
}

/** Compute the absolute origin the API is being served from, using the
 *  incoming request's host (honouring `X-Forwarded-Proto` / `Host` so
 *  Render's TLS terminator works). Falls back to `process.env.PUBLIC_API_URL`
 *  if the request host is unavailable. */
export function apiOrigin(req: Request | null | undefined): string {
  const envUrl = process.env['PUBLIC_API_URL'];
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (req) {
    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
      req.protocol ||
      'https';
    const host = (req.headers['x-forwarded-host'] as string | undefined) || req.headers.host;
    if (host) return `${proto}://${host}`;
  }
  return 'http://localhost:4000';
}

/** Rewrite a storage URL to a network-reachable URL. When the storage
 *  is on a private network (LAN / loopback), the URL is rewritten to
 *  the API's own /files proxy at the API origin so the user panel on
 *  any network can fetch it. Public CDN URLs pass through unchanged. */
export function publicPhotoUrl(
  url: string | null | undefined,
  req?: Request | null,
): string | null {
  if (!url) return null;
  if (!isPrivateNetworkUrl(url)) return url;
  const split = splitStorageUrl(url);
  if (!split) return url;
  return `${apiOrigin(req)}/files/${split.bucket}/${split.key}`;
}
