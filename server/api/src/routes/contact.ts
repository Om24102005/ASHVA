/** Gatekeeper — authed OTP to add+verify the missing contact channel. */
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, bad, unauthorized } from '../http.js';
import { requireAuth } from '../auth/middleware.js';
import { createChallenge, verifyChallenge } from '../otp.js';
import { getUserProfile } from '../repo.js';

export const contactRouter = Router();
contactRouter.use(requireAuth);

contactRouter.post(
  '/otp/start',
  asyncHandler(async (req, res) => {
    const { channel, destination } = z
      .object({ channel: z.enum(['phone', 'email']), destination: z.string().min(3) })
      .parse(req.body);
    res.json(await createChallenge(channel, destination, req.auth!.sub));
  }),
);

contactRouter.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const { challengeId, code } = z.object({ challengeId: z.string().min(1), code: z.string().min(4) }).parse(req.body);
    const ch = await verifyChallenge(challengeId, code);
    const userId = req.auth!.sub;
    try {
      if (ch.channel === 'phone') {
        await query(`UPDATE contact_info SET phone = $2, phone_verified = true, phone_verified_at = now() WHERE user_id = $1`, [userId, ch.destination]);
      } else {
        await query(`UPDATE contact_info SET email = $2, email_verified = true, email_verified_at = now() WHERE user_id = $1`, [userId, ch.destination.toLowerCase()]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('unique') || msg.includes('duplicate')) throw bad(`That ${ch.channel} is already linked to another account.`);
      throw e;
    }
    const user = await getUserProfile(userId);
    if (!user) throw unauthorized();
    res.json({ user });
  }),
);
