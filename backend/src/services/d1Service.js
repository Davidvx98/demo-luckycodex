/**
 * d1Service.js
 *
 * Abstracción de la base de datos.
 * - En desarrollo local: usa better-sqlite3 apuntando a un archivo .db local.
 * - En Cloudflare Workers: usa la binding D1 inyectada por Wrangler.
 *
 * NOTA: La binding de Workers se configura en la Fase 3 (deploy).
 *       Por ahora basta con el cliente local para desarrollo.
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = join(__dirname, '../../../lbot-dev.db');

let _db = null;

export function getDB(d1Binding = null) {
  // En Workers, Wrangler pasa la binding D1 directamente
  if (d1Binding) return d1Binding;

  // En local, reutilizamos la conexion SQLite
  if (!_db) {
    console.log(`[db] Abriendo base de datos: ${DB_PATH}`);
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    console.log('[db] Conexion establecida');
  }
  return _db;
}
