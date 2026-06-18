/**
 * OTP engine — 6-digit code, delivered via MSG91 (SMS/Email), verified here.
 * Challenges live in memory with a short TTL (real delivery, ephemeral store).
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { ApiError } from './http.js';
import { sendSmsCode } from './providers/msg91.js';
import { sendEmailCode } from './providers/email.js';
import { ContactStep, OtpChallenge } from './types.js';

interface Challenge {
  channel: ContactStep;
  destination: string;
  codeHash: string;
  expiresAt: number;
  userId?: string;
  attempts: number;
}

const store = new Map<string, Challenge>();
const gen6 = (): string => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export async function createChallenge(channel: ContactStep, destination: string, userId?: string): Promise<OtpChallenge> {
  if (!destination) throw new ApiError(400, 'BAD_REQUEST', 'A destination is required.');
  const code = gen6();
  const id = crypto.randomUUID();
  const codeHash = await bcrypt.hash(code, 8);
  store.set(id, { channel, destination, codeHash, expiresAt: Date.now() + env.otpTtlSec * 1000, userId, attempts: 0 });
  if (channel === 'phone') await sendSmsCode(destination, code);
  else await sendEmailCode(destination, code);
  return { challengeId: id, destination, channel, expiresInSec: env.otpTtlSec };
}

export async function verifyChallenge(challengeId: string, code: string): Promise<Challenge> {
  const ch = store.get(challengeId);
  if (!ch) throw new ApiError(400, 'OTP_INVALID', 'This code request expired. Please resend.');
  if (Date.now() > ch.expiresAt) {
    store.delete(challengeId);
    throw new ApiError(400, 'OTP_EXPIRED', 'The code expired. Please resend.');
  }
  if (ch.attempts >= 5) {
    store.delete(challengeId);
    throw new ApiError(429, 'OTP_LOCKED', 'Too many attempts. Please resend.');
  }
  ch.attempts += 1;
  if (!(await bcrypt.compare(code, ch.codeHash))) throw new ApiError(400, 'OTP_WRONG', 'Incorrect code. Try again.');
  store.delete(challengeId);
  return ch;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, ch] of store) if (now > ch.expiresAt) store.delete(id);
}, 60_000).unref?.();
