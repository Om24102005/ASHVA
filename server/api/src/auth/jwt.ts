/** JWT issue/verify. */
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { AuthClaims, UserRole } from '../types.js';

export function signToken(sub: string, role: UserRole): string {
  return jwt.sign({ sub, role }, env.jwtSecret, { algorithm: 'HS256', expiresIn: `${env.jwtExpiresDays}d` });
}

export function verifyToken(token: string): AuthClaims | null {
  try {
    // Pin the algorithm — never accept 'none' or an RS/HS confusion token.
    const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    if (!decoded.sub || typeof decoded.sub !== 'string') return null;
    return { sub: decoded.sub, role: (decoded.role as UserRole) ?? 'user' };
  } catch {
    return null;
  }
}
