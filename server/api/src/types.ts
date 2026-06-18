/** API response shapes (camelCase) consumed by the ASHVA web client. */
export type UserRole = 'user' | 'admin';
export type ContactStep = 'phone' | 'email';

export interface ContactInfo {
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  countryCode: string;
}
export interface UserProfile {
  id: string;
  displayName: string | null;
  role: UserRole;
  status: string;
  onboarding: string | null;
  avatarUrl: string | null;
  contact: ContactInfo;
  createdAt: string;
}
export interface Session {
  token: string;
  user: UserProfile;
  method: 'email' | 'phone' | 'google';
}
export interface OtpChallenge {
  challengeId: string;
  destination: string;
  channel: ContactStep;
  expiresInSec: number;
}
export interface AuthClaims {
  sub: string;
  role: UserRole;
}
