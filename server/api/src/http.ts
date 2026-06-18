/** HTTP helpers: ApiError + async wrapper + error middleware. */
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const bad = (msg: string) => new ApiError(400, 'BAD_REQUEST', msg);
export const unauthorized = (msg = 'Unauthorized') => new ApiError(401, 'UNAUTHORIZED', msg);
export const notFound = (msg = 'Not found') => new ApiError(404, 'NOT_FOUND', msg);

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first && first.path.length ? `${first.path.join('.')}: ` : '';
    res.status(400).json({ code: 'BAD_REQUEST', message: `${field}${first ? first.message : 'Invalid request.'}` });
    return;
  }
  console.error('[unhandled]', err instanceof Error ? err.stack : err);
  res.status(500).json({ code: 'INTERNAL', message: 'Something went wrong. Please try again.' });
}
