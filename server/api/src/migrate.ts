/** Idempotent schema bootstrap + incremental migrations. */
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

export async function runMigrations(): Promise<void> {
  // M001: add photo_url column to assets
  const { rows } = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='assets' AND column_name='photo_url'
  `);
  if (!rows.length) {
    await pool.query(`
      ALTER TABLE assets ADD COLUMN photo_url text;
      UPDATE assets SET photo_url = specs->>'photoUrl'
        WHERE specs->>'photoUrl' IS NOT NULL AND specs->>'photoUrl' != '';
    `);
    console.log('[db] M001: added photo_url to assets');
  }
}
