/**
 * authService.js
 *
 * Lógica de negocio de autenticación.
 * Implementación Fase 4: argon2 + jsonwebtoken + SQLite local (D1 en prod).
 */

import argon2   from 'argon2';
import jwt      from 'jsonwebtoken';
import crypto   from 'crypto';
import { getDB } from './d1Service.js';

// ── Helpers ──────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, planId: user.plan_id ?? null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' },
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

function storeSession(db, userId, refreshToken) {
  db.prepare(`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `).run(userId, hashToken(refreshToken), refreshExpiresAt());
}

// ── Registro ─────────────────────────────────────────────────

export async function registerWithEmail({ email, password, name }) {
  const db = getDB();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    throw err;
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name)
    VALUES (?, ?, ?)
  `).run(email, passwordHash, name ?? null);

  const user = db.prepare('SELECT id, email, name, plan_id FROM users WHERE id = ?')
                 .get(result.lastInsertRowid);

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  storeSession(db, user.id, refreshToken);

  return { accessToken, refreshToken, user };
}

// ── Login ─────────────────────────────────────────────────────

export async function loginWithEmail({ email, password }) {
  const db = getDB();

  const user = db.prepare(
    'SELECT id, email, name, plan_id, password_hash FROM users WHERE email = ?'
  ).get(email);

  if (!user) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  const { password_hash: _omit, ...safeUser } = user;

  const accessToken  = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken();
  storeSession(db, safeUser.id, refreshToken);

  return { accessToken, refreshToken, user: safeUser };
}

// ── Logout ────────────────────────────────────────────────────

export async function logout(userId) {
  const db = getDB();
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

// ── Refresh token ─────────────────────────────────────────────

export async function refreshAccessToken(refreshToken) {
  const db   = getDB();
  const hash = hashToken(refreshToken);

  const session = db.prepare(`
    SELECT s.*, u.id as uid, u.email, u.plan_id
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > datetime('now')
  `).get(hash);

  if (!session) {
    const err = new Error('Sesión expirada');
    err.status = 401;
    throw err;
  }

  const user = { id: session.uid, email: session.email, plan_id: session.plan_id };
  const accessToken = generateAccessToken(user);

  return { accessToken };
}

// ── Google OAuth ──────────────────────────────────────────────
// Stub — se implementa en Fase 5 (pagos + OAuth completo)

export async function loginWithGoogle(_code) {
  throw new Error('Google OAuth no disponible en la demo');
}
