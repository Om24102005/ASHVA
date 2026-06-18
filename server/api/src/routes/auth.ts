/** Auth routes — email, phone (OTP), Google. Issues JWT sessions. */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, bad, unauthorized } from '../http.js';
import { signToken } from '../auth/jwt.js';
import { getUserProfile } from '../repo.js';
import { createChallenge, verifyChallenge } from '../otp.js';
import { verifyGoogleIdToken } from '../providers/google.js';
import { Session } from '../types.js';

export const authRouter = Router();

async function sessionFor(userId: string, method: Session['method']): Promise<Session> {
  const user = await getUserProfile(userId);
  if (!user) throw unauthorized('Account not found.');
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
  return { token: signToken(user.id, user.role), user, method };
}

authRouter.post(
  '/signup/email',
  asyncHandler(async (req, res) => {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const lower = email.toLowerCase();
    const exists = await query('SELECT user_id FROM contact_info WHERE email = $1', [lower]);
    if (exists.rows[0]) throw bad('An account with this email already exists.');
    const { rows } = await query(
      `INSERT INTO users (display_name, role, onboarding) VALUES ($1,'user','email_first') RETURNING id`,
      [lower.split('@')[0]],
    );
    const userId = rows[0]!.id as string;
    await query('INSERT INTO credentials (user_id, password_hash) VALUES ($1,$2)', [userId, await bcrypt.hash(password, 10)]);
    await query(
      `INSERT INTO contact_info (user_id, email, email_verified, email_verified_at) VALUES ($1,$2,true,now())`,
      [userId, lower],
    );
    res.json(await sessionFor(userId, 'email'));
  }),
);

authRouter.post(
  '/signin/email',
  asyncHandler(async (req, res) => {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const lower = email.toLowerCase();
    const { rows } = await query(
      `SELECT u.id, cr.password_hash
         FROM contact_info c JOIN users u ON u.id = c.user_id JOIN credentials cr ON cr.user_id = u.id
        WHERE c.email = $1`,
      [lower],
    );
    const row = rows[0];
    if (!row) throw unauthorized('Incorrect email or password.');
    if (!(await bcrypt.compare(password, row.password_hash as string))) throw unauthorized('Incorrect email or password.');
    res.json(await sessionFor(row.id as string, 'email'));
  }),
);

authRouter.post(
  '/otp/start',
  asyncHandler(async (req, res) => {
    const { channel, destination } = z
      .object({ channel: z.enum(['phone', 'email']), destination: z.string().min(3) })
      .parse(req.body);
    res.json(await createChallenge(channel, destination));
  }),
);

authRouter.post(
  '/signin/phone',
  asyncHandler(async (req, res) => {
    const { countryCode, phone, challengeId, code } = z
      .object({ countryCode: z.string().min(1), phone: z.string().min(6), challengeId: z.string().min(1), code: z.string().min(4) })
      .parse(req.body);
    await verifyChallenge(challengeId, code);
    const full = `${countryCode} ${phone}`;
    const found = await query('SELECT user_id FROM contact_info WHERE phone = $1', [full]);
    let userId = found.rows[0]?.user_id as string | undefined;
    if (!userId) {
      const ins = await query(`INSERT INTO users (display_name, role, onboarding) VALUES ($1,'user','phone_first') RETURNING id`, [phone]);
      userId = ins.rows[0]!.id as string;
      await query(
        `INSERT INTO contact_info (user_id, phone, phone_verified, phone_verified_at, country_code) VALUES ($1,$2,true,now(),$3)`,
        [userId, full, countryCode],
      );
    } else {
      await query(`UPDATE contact_info SET phone_verified = true, phone_verified_at = now() WHERE user_id = $1`, [userId]);
    }
    res.json(await sessionFor(userId, 'phone'));
  }),
);

/* channel-agnostic OTP sign-in (ASHVA enters a contact, gets a code, is in).
   email -> emailVerified; phone -> phoneVerified. Gatekeeper forces the other. */
authRouter.post(
  '/otp/signin',
  asyncHandler(async (req, res) => {
    const { channel, destination, challengeId, code, countryCode } = z
      .object({
        channel: z.enum(['email', 'phone']),
        destination: z.string().min(3),
        challengeId: z.string().min(1),
        code: z.string().min(4),
        countryCode: z.string().optional().default('+91'),
      })
      .parse(req.body);
    await verifyChallenge(challengeId, code);

    const col = channel === 'email' ? 'email' : 'phone';
    const value = channel === 'email' ? destination.toLowerCase() : destination;
    const found = await query(`SELECT user_id FROM contact_info WHERE ${col} = $1`, [value]);
    let userId = found.rows[0]?.user_id as string | undefined;

    if (!userId) {
      const onboarding = channel === 'email' ? 'email_first' : 'phone_first';
      const label = channel === 'email' ? value.split('@')[0] : destination;
      const ins = await query(`INSERT INTO users (display_name, role, onboarding) VALUES ($1,'user',$2) RETURNING id`, [label, onboarding]);
      userId = ins.rows[0]!.id as string;
      if (channel === 'email') {
        await query(`INSERT INTO contact_info (user_id, email, email_verified, email_verified_at) VALUES ($1,$2,true,now())`, [userId, value]);
      } else {
        await query(
          `INSERT INTO contact_info (user_id, phone, phone_verified, phone_verified_at, country_code) VALUES ($1,$2,true,now(),$3)`,
          [userId, value, countryCode],
        );
      }
    } else {
      const setCol = channel === 'email' ? 'email_verified = true, email_verified_at = now()' : 'phone_verified = true, phone_verified_at = now()';
      await query(`UPDATE contact_info SET ${setCol} WHERE user_id = $1`, [userId]);
    }
    res.json(await sessionFor(userId, channel === 'email' ? 'email' : 'phone'));
  }),
);

authRouter.post(
  '/signin/google',
  asyncHandler(async (req, res) => {
    const { idToken } = z.object({ idToken: z.string().min(10) }).parse(req.body);
    const profile = await verifyGoogleIdToken(idToken);
    const link = await query(`SELECT user_id FROM social_accounts WHERE provider = 'google' AND provider_uid = $1`, [profile.sub]);
    let userId = link.rows[0]?.user_id as string | undefined;
    if (!userId && profile.email) {
      const byEmail = await query('SELECT user_id FROM contact_info WHERE email = $1', [profile.email.toLowerCase()]);
      userId = byEmail.rows[0]?.user_id as string | undefined;
    }
    if (!userId) {
      const ins = await query(`INSERT INTO users (display_name, role, onboarding) VALUES ($1,'user','social_first') RETURNING id`, [profile.name]);
      userId = ins.rows[0]!.id as string;
      await query(
        `INSERT INTO contact_info (user_id, email, email_verified, email_verified_at)
         VALUES ($1,$2,$3, CASE WHEN $3 THEN now() ELSE NULL END) ON CONFLICT (user_id) DO NOTHING`,
        [userId, profile.email.toLowerCase() || null, profile.emailVerified],
      );
    }
    await query(
      `INSERT INTO social_accounts (user_id, provider, provider_uid, email) VALUES ($1,'google',$2,$3)
       ON CONFLICT (provider, provider_uid) DO NOTHING`,
      [userId, profile.sub, profile.email.toLowerCase() || null],
    );
    res.json(await sessionFor(userId, 'google'));
  }),
);
