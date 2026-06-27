/** S3-compatible storage (MinIO). Uploads KYC docs, returns a public URL. */
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { env } from '../env.js';
import { ApiError } from '../http.js';

const s3Enabled = !!(env.s3.accessKey && env.s3.secretKey);

const client = s3Enabled ? new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  forcePathStyle: true,
  credentials: { accessKeyId: env.s3.accessKey, secretAccessKey: env.s3.secretKey },
}) : null;

export async function ensureBucket(): Promise<void> {
  if (!s3Enabled || !client) { console.warn('[storage] S3 not configured — KYC uploads disabled.'); return; }
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.s3.bucket }));
  } catch (e: unknown) {
    const status = (e as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    if (status === 404 || status === undefined) {
      // Bucket doesn't exist — try to create it.
      try {
        await client.send(new CreateBucketCommand({ Bucket: env.s3.bucket }));
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
  if (!s3Enabled || !client) throw new ApiError(503, 'STORAGE_DISABLED', 'KYC storage not configured.');
  try {
    await client.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: body, ContentType: contentType }));
    return `${env.s3.publicUrl.replace(/\/$/, '')}/${env.s3.bucket}/${key}`;
  } catch (e) {
    throw new ApiError(502, 'UPLOAD_FAILED', `Storage upload failed: ${e instanceof Error ? e.message : 'unknown'}`);
  }
}
