/**
 * seed.js — Inicializa la base de datos SQLite local de desarrollo.
 *
 * Ejecutar con: node src/db/seed.js
 *
 * Crea el archivo lbot-dev.db en la raíz del backend con:
 *   - Todas las tablas del esquema
 *   - Los 2 planes de Digimon Masters Online
 *   - Un usuario de prueba: prueba@lbot.dev / prueba
 */

import { createRequire } from 'module';
import { readFileSync }  from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import argon2             from 'argon2';
import Database           from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = join(__dirname, '../../../lbot-dev.db');
const SQL_PATH  = join(__dirname, 'schema.sql');

console.log('📦 Inicializando base de datos local...');
console.log(`   Ruta: ${DB_PATH}\n`);

// ── 1. Crear / abrir la base de datos ─────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys  = ON');

// ── 2. Ejecutar el esquema completo ────────────────────────────────────────
const schema = readFileSync(SQL_PATH, 'utf8');
db.exec(schema);
console.log('✅ Esquema aplicado (tablas y planes)');

// ── 3. Insertar usuario de prueba ──────────────────────────────────────────
const TEST_EMAIL    = 'prueba@lbot.dev';
const TEST_PASSWORD = 'prueba';
const TEST_NAME     = 'Usuario de Prueba';

// Verificar si ya existe
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(TEST_EMAIL);

if (existing) {
  console.log(`ℹ️  Usuario de prueba ya existe (id: ${existing.id}) — sin cambios.`);
} else {
  // Hash con Argon2id (el más seguro, parámetros por defecto de argon2 v2)
  const hash = await argon2.hash(TEST_PASSWORD, {
    type:        argon2.argon2id,
    memoryCost:  65536,   // 64 MB
    timeCost:    3,
    parallelism: 4,
  });

  const result = db.prepare(
    `INSERT INTO users (email, password_hash, name, plan_id, plan_expires_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    TEST_EMAIL,
    hash,
    TEST_NAME,
    2,                                         // Plan Pro (id=2) para ver todo el dashboard
    '2099-12-31T23:59:59.000Z',               // Expira "nunca" en pruebas
  );

  console.log(`✅ Usuario de prueba creado (id: ${result.lastInsertRowid})`);
  console.log(`   Email:    ${TEST_EMAIL}`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log(`   Plan:     Farmer Pro (id=2)`);
}

// ── 4. Mostrar resumen de la DB ────────────────────────────────────────────
console.log('\n── Resumen ────────────────────────────────────');
const plans = db.prepare('SELECT id, name, price_usd FROM plans').all();
console.log('Planes:', plans);

const users = db.prepare('SELECT id, email, name, plan_id FROM users').all();
console.log('Usuarios:', users);
console.log('───────────────────────────────────────────────\n');

db.close();
console.log('✅ Base de datos lista en:', DB_PATH);
