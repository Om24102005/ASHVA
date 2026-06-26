/**
 * MSG91 provider — SMS OTP via dedicated OTP endpoint (not flow).
 * MSG91 returns HTTP 200 even on errors; we check the `type` field in the body.
 * In non-production, always logs the code to console regardless of delivery status.
 */
import { env } from '../env.js';
import { ApiError } from '../http.js';

const OTP_URL = 'https://control.msg91.com/api/v5/otp';
const EMAIL_URL = 'https://control.msg91.com/api/v5/email/send';

function configured(): boolean {
  return env.msg91.authkey.length > 0;
}

export async function sendSmsCode(mobileE164: string, code: string): Promise<void> {
  if (!configured()) {
    if (env.nodeEnv !== 'production') return; // dev console log handled in otp.ts
    throw new ApiError(500, 'SMS_NOT_CONFIGURED', 'SMS delivery is not configured.');
  }
  // strip everything except digits — MSG91 OTP endpoint needs "919XXXXXXXXX"
  const mobile = mobileE164.replace(/\D/g, '');
  const res = await fetch(OTP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: env.msg91.authkey },
    body: JSON.stringify({
      template_id: env.msg91.smsTemplateId,
      mobile,
      otp: code,
    }),
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.error(`[msg91] HTTP ${res.status}: ${text}`);
    throw new ApiError(502, 'SMS_SEND_FAILED', `SMS delivery failed (${res.status})`);
  }
  let body: { type?: string; message?: string } = {};
  try { body = JSON.parse(text); } catch { /* non-JSON response */ }
  console.log(`[msg91] OTP to ${mobile}: type=${body.type} msg=${body.message}`);
  if (body.type === 'error') {
    throw new ApiError(502, 'SMS_SEND_FAILED', `MSG91: ${body.message || 'unknown error'}`);
  }
}

export async function sendEmailCode(toEmail: string, code: string): Promise<void> {
  if (!configured()) {
    if (env.nodeEnv !== 'production') return; // dev console log handled in otp.ts
    throw new ApiError(500, 'EMAIL_NOT_CONFIGURED', 'Email delivery is not configured.');
  }
  const res = await fetch(EMAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: env.msg91.authkey },
    body: JSON.stringify({
      recipients: [{ to: [{ email: toEmail }], variables: { otp: code, code } }],
      from: { email: env.msg91.emailFrom },
      domain: env.msg91.emailDomain,
      template_id: env.msg91.emailTemplateId || undefined,
      subject: 'Your ASHVA verification code',
      body: env.msg91.emailTemplateId ? undefined : `Your ASHVA code is ${code}. It expires shortly.`,
    }),
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.error(`[msg91] email HTTP ${res.status}: ${text}`);
    throw new ApiError(502, 'EMAIL_SEND_FAILED', `Email delivery failed (${res.status})`);
  }
  let body: { type?: string; message?: string } = {};
  try { body = JSON.parse(text); } catch { /* non-JSON */ }
  console.log(`[msg91] email to ${toEmail}: type=${body.type} msg=${body.message}`);
  if (body.type === 'error') {
    throw new ApiError(502, 'EMAIL_SEND_FAILED', `MSG91: ${body.message || 'unknown error'}`);
  }
}
