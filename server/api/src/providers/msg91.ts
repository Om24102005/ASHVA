/**
 * MSG91 provider — real SMS + Email delivery. If MSG91_AUTHKEY is unset in
 * non-production, logs the code to the server console so you can test before
 * keys land (never in production).
 */
import { env } from '../env.js';
import { ApiError } from '../http.js';

const SMS_URL = 'https://control.msg91.com/api/v5/flow/';
const EMAIL_URL = 'https://control.msg91.com/api/v5/email/send';

function configured(): boolean {
  return env.msg91.authkey.length > 0;
}

export async function sendSmsCode(mobileE164: string, code: string): Promise<void> {
  if (!configured()) {
    if (env.nodeEnv !== 'production') {
      console.log(`[msg91:dev] SMS to ${mobileE164}: code=${code}`);
      return;
    }
    throw new ApiError(500, 'SMS_NOT_CONFIGURED', 'SMS delivery is not configured.');
  }
  const mobiles = mobileE164.replace(/^\+/, '');
  const res = await fetch(SMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: env.msg91.authkey },
    body: JSON.stringify({
      template_id: env.msg91.smsTemplateId,
      sender: env.msg91.senderId,
      short_url: '0',
      recipients: [{ mobiles, otp: code, var1: code, code }],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(502, 'SMS_SEND_FAILED', `MSG91 SMS failed: ${text || res.status}`);
  }
}

export async function sendEmailCode(toEmail: string, code: string): Promise<void> {
  if (!configured()) {
    if (env.nodeEnv !== 'production') {
      console.log(`[msg91:dev] EMAIL to ${toEmail}: code=${code}`);
      return;
    }
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
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(502, 'EMAIL_SEND_FAILED', `MSG91 Email failed: ${text || res.status}`);
  }
}
