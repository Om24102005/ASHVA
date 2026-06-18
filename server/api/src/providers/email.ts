/**
 * Email OTP sender. Prefers SMTP (e.g. Gmail app password) which works without
 * a verified sending domain; falls back to MSG91 email (needs a verified
 * domain), then to a dev console log. Throws a friendly error on failure.
 */
import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../env.js';
import { ApiError } from '../http.js';
import { sendEmailCode as msg91Email } from './msg91.js';

let transporter: Transporter | null = null;
function smtp(): Transporter | null {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export async function sendEmailCode(to: string, code: string): Promise<void> {
  const t = smtp();
  if (t) {
    try {
      await t.sendMail({
        from: env.smtp.from || env.smtp.user,
        to,
        subject: 'Your ASHVA verification code',
        text: `Your ASHVA verification code is ${code}. It expires in a few minutes.`,
        html: `<p>Your ASHVA verification code is <b style="font-size:18px">${code}</b>.</p><p>It expires in a few minutes.</p>`,
      });
      return;
    } catch (e) {
      throw new ApiError(502, 'EMAIL_SEND_FAILED', `SMTP email failed: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }
  // No SMTP -> try MSG91 (verified domain) or its dev-log fallback.
  return msg91Email(to, code);
}
