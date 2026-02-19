import jwt from 'jsonwebtoken';

/**
 * Middleware de protección de rutas.
 * Lee el JWT desde la cookie httpOnly `access_token`.
 * Si es válido, inyecta `req.user` con { id, email, planId }.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id:     payload.sub,
      email:  payload.email,
      planId: payload.planId ?? null,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}
