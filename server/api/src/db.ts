/** Postgres pool + tiny query helper. */
import pg from 'pg';
import { env } from './env.js';

export const pool = new pg.Pool({
  host: env.pg.host,
  port: env.pg.port,
  user: env.pg.user,
  password: env.pg.password,
  database: env.pg.database,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('[pg pool error]', err.message));

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params as never[]);
}

export async function waitForDb(retries = 10, delayMs = 2000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch {
      console.log(`[db] not ready (${i + 1}/${retries})…`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Database not reachable after retries');
}
