/** Express auth middleware — attaches req.auth or 401s. */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt.js';
import { AuthClaims } from '../types.js';
import { unauthorized } from '../http.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const claims = token ? verifyToken(token) : null;
  if (!claims) {
    next(unauthorized('Sign in to continue.'));
    return;
  }
  req.auth = claims;
  next();
}
