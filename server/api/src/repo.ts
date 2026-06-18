/** Data access + row->API mapping. */
import { query } from './db.js';
import { UserProfile } from './types.js';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { rows } = await query(
    `SELECT u.id, u.display_name, u.role, u.status, u.onboarding, u.avatar_url, u.created_at,
            c.email, c.email_verified, c.phone, c.phone_verified, c.country_code
       FROM users u
       LEFT JOIN contact_info c ON c.user_id = u.id
      WHERE u.id = $1`,
    [userId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    displayName: r.display_name,
    role: r.role,
    status: r.status,
    onboarding: r.onboarding,
    avatarUrl: r.avatar_url,
    createdAt: new Date(r.created_at).toISOString(),
    contact: {
      email: r.email ?? null,
      emailVerified: r.email_verified ?? false,
      phone: r.phone ?? null,
      phoneVerified: r.phone_verified ?? false,
      countryCode: r.country_code ?? '+91',
    },
  };
}
