import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ── Limitadores por ruta ────────────────────────────────────

/** Rutas de auth: máximo 10 intentos por 15 min por IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Inténtalo en 15 minutos.' },
});

/** API general: 100 req/min */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Webhooks: sin límite (vienen del proveedor) */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
});

// ── Helmet: cabeceras de seguridad HTTP ─────────────────────
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// ── Middleware combinado ────────────────────────────────────
export function securityMiddleware(req, res, next) {
  helmetConfig(req, res, () => generalLimiter(req, res, next));
}
