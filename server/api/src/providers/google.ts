/** Verify a Google ID token against configured client IDs. */
import { OAuth2Client } from 'google-auth-library';
import { env } from '../env.js';
import { ApiError } from '../http.js';

const client = new OAuth2Client();

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (env.googleClientIds.length === 0) {
    throw new ApiError(500, 'GOOGLE_NOT_CONFIGURED', 'Google sign-in is not configured on the server.');
  }
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: env.googleClientIds });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub) throw new Error('No payload');
    return {
      sub: payload.sub,
      email: payload.email ?? '',
      name: payload.name ?? 'Google User',
      emailVerified: payload.email_verified ?? false,
    };
  } catch (e) {
    throw new ApiError(401, 'GOOGLE_INVALID', `Invalid Google token: ${e instanceof Error ? e.message : 'unknown'}`);
  }
}
