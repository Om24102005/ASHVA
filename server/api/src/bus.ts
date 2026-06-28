/** Tiny in-memory pub/sub used to push fleet changes to user panels in real time.
 *  Subscribers are Express `Response` objects already configured for SSE
 *  (see routes/stream.ts). Failures while writing to a subscriber are swallowed
 *  and the subscriber is dropped — dead connections must not break other fans.
 */
import type { Response } from 'express';

type Subscriber = {
  res: Response;
  userId: string | null;
  alive: boolean;
};

const subscribers = new Set<Subscriber>();

/** Monotonically increasing version counter; bumped on every emit. Used by the
 *  /context/assets/version fallback so polling clients can detect changes
 *  cheaply without re-downloading the whole fleet. */
let version = 0;
export function currentVersion(): number { return version; }

export function subscribe(res: Response, userId: string | null): void {
  const sub: Subscriber = { res, userId, alive: true };
  subscribers.add(sub);
  // If the client disconnects, drop the subscriber and stop the heartbeat.
  res.on('close', () => {
    sub.alive = false;
    subscribers.delete(sub);
  });
}

export function unsubscribe(res: Response): void {
  for (const s of subscribers) {
    if (s.res === res) {
      s.alive = false;
      subscribers.delete(s);
      return;
    }
  }
}

export function emit(topic: string, payload: unknown): void {
  version += 1;
  const data = JSON.stringify(payload);
  const frame = `event: ${topic}\ndata: ${data}\n\n`;
  for (const s of subscribers) {
    if (!s.alive) { subscribers.delete(s); continue; }
    try {
      s.res.write(frame);
    } catch {
      s.alive = false;
      subscribers.delete(s);
    }
  }
}

export function subscriberCount(): number { return subscribers.size; }