/** Central env access. Throws early on missing criticals. */
function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') throw new Error(`Missing required env: ${name}`);
  return v;
}
function opt(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const env = {
  // Render/most PaaS inject PORT; fall back to API_PORT, then 4000.
  port: Number(opt('PORT', '') || opt('API_PORT', '4000')),
  nodeEnv: opt('NODE_ENV', 'development'),
  pg: {
    host: opt('PGHOST', 'localhost'),
    port: Number(opt('PGPORT', '5432')),
    user: opt('PGUSER', 'ashva'),
    password: req('PGPASSWORD'),
    database: opt('PGDATABASE', 'ashva'),
  },
  jwtSecret: req('JWT_SECRET'),
  jwtExpiresDays: Number(opt('JWT_EXPIRES_DAYS', '30')),
  otpTtlSec: Number(opt('OTP_TTL_SEC', '300')),
  msg91: {
    authkey: opt('MSG91_AUTHKEY'),
    senderId: opt('MSG91_SENDER_ID', 'ASHVA'),
    smsTemplateId: opt('MSG91_SMS_TEMPLATE_ID'),
    emailFrom: opt('MSG91_EMAIL_FROM'),
    emailDomain: opt('MSG91_EMAIL_DOMAIN'),
    emailTemplateId: opt('MSG91_EMAIL_TEMPLATE_ID'),
  },
  smtp: {
    host: opt('SMTP_HOST'),
    port: Number(opt('SMTP_PORT', '587')),
    user: opt('SMTP_USER'),
    pass: opt('SMTP_PASS'),
    from: opt('SMTP_FROM') || opt('SMTP_USER'),
  },
  googleClientIds: opt('GOOGLE_CLIENT_IDS').split(',').map((s) => s.trim()).filter(Boolean),
  s3: {
    endpoint: opt('S3_ENDPOINT', 'http://minio:9000'),
    publicUrl: opt('S3_PUBLIC_URL', 'http://localhost:9000'),
    region: opt('S3_REGION', 'us-east-1'),
    bucket: opt('S3_BUCKET', 'kyc'),
    accessKey: req('S3_ACCESS_KEY'),
    secretKey: req('S3_SECRET_KEY'),
  },
};
