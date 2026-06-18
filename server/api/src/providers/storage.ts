/** S3-compatible storage (MinIO). Uploads KYC docs, returns a public URL. */
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { env } from '../env.js';
import { ApiError } from '../http.js';

const client = new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  forcePathStyle: true,
  credentials: { accessKeyId: env.s3.accessKey, secretAccessKey: env.s3.secretKey },
});

export async function ensureBucket(): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.s3.bucket }));
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket: env.s3.bucket }));
    } catch (e) {
      console.warn('[storage] could not ensure bucket:', e instanceof Error ? e.message : e);
    }
  }
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  try {
    await client.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: body, ContentType: contentType }));
    return `${env.s3.publicUrl.replace(/\/$/, '')}/${env.s3.bucket}/${key}`;
  } catch (e) {
    throw new ApiError(502, 'UPLOAD_FAILED', `Storage upload failed: ${e instanceof Error ? e.message : 'unknown'}`);
  }
}
