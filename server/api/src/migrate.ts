/** Idempotent schema bootstrap. Runs init.sql once over the (internal) pool if
 *  the schema isn't present yet — so a fresh managed Postgres self-initializes
 *  on first deploy, with no external DB exposure. */
import fs from 'fs';
import path from 'path';
import { pool } from './db.js';

export async function ensureSchema(): Promise<void> {
  const { rows } = await pool.query("SELECT to_regclass('public.users') AS t");
  if (rows[0]?.t) {
    console.log('[db] schema already present — skipping init');
    return;
  }
  const file = path.resolve(process.cwd(), 'init.sql');
  if (!fs.existsSync(file)) {
    console.warn('[db] init.sql not found at', file, '— skipping schema bootstrap');
    return;
  }
  console.log('[db] initializing schema from init.sql…');
  const sql = fs.readFileSync(file, 'utf8');
  await pool.query(sql);
  console.log('[db] schema initialized');
}
