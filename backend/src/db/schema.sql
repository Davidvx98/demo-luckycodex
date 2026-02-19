-- ============================================================
-- LBOT — Esquema de base de datos (Cloudflare D1 / SQLite)
-- ============================================================
-- Ejecutar con: wrangler d1 execute lbot-db --file=src/db/schema.sql
-- ============================================================

PRAGMA journal_mode = WAL;

-- ------------------------------------------------------------
-- Tabla: plans
-- Definición de los planes de suscripción disponibles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,       -- ej: "Básico", "Pro", "Elite"
  price_usd   REAL    NOT NULL,
  interval    TEXT    NOT NULL DEFAULT 'monthly', -- monthly | yearly | lifetime
  features    TEXT    NOT NULL DEFAULT '[]',  -- JSON array de strings
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Tabla: users
-- Usuarios registrados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT,                          -- NULL si login sólo con Google
  google_id     TEXT    UNIQUE,                -- NULL si login sólo con email
  name          TEXT,
  plan_id       INTEGER REFERENCES plans(id),  -- plan activo (NULL = sin plan)
  plan_expires_at TEXT,                        -- fecha expiración ISO8601
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Tabla: sessions
-- Refresh tokens para rotación de JWT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT    NOT NULL UNIQUE,         -- hash del refresh token
  ip          TEXT,
  user_agent  TEXT,
  expires_at  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Tabla: payments
-- Registro de todos los pagos (confirmados por webhook)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  plan_id         INTEGER NOT NULL REFERENCES plans(id),
  provider        TEXT    NOT NULL,            -- stripe | paypal | crypto
  provider_ref    TEXT    NOT NULL UNIQUE,     -- ID del proveedor externo
  amount_usd      REAL    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'pending', -- pending | completed | failed | refunded
  webhook_verified INTEGER NOT NULL DEFAULT 0, -- 1 = verificado por webhook
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google   ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user  ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user  ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref   ON payments(provider_ref);

-- ------------------------------------------------------------
-- Datos iniciales: planes DMO
-- ------------------------------------------------------------
INSERT OR IGNORE INTO plans (id, name, price_usd, interval, features) VALUES
  (1, 'Farmer Básico',  2.00, 'monthly', '["Bot de farmeo automático de Teras","1 cuenta de DMO","Rutas de farmeo básicas (Dats Area, Western Area)","Soporte por Discord","Actualizaciones incluidas"]'),
  (2, 'Farmer Pro',     5.00, 'monthly', '["Bot de farmeo automático de Teras","Hasta 3 cuentas de DMO","Todas las rutas de farmeo (Dats, Western, Server, Infinite Ice Wall)","Anti-detección mejorado","Configuración de loot personalizada","Soporte prioritario 24/7","Actualizaciones incluidas"]');
