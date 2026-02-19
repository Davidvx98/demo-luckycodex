/**
 * authController.js
 *
 * Controladores de autenticación.
 * Toda la lógica de negocio delega en authService.js.
 * Los controladores solo orquestan request/response.
 */

import * as authService from '../services/authService.js';

// ── Cookie segura estándar ──────────────────────────────────
function setAccessCookie(res, token) {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   15 * 60 * 1000, // 15 minutos
  });
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/api/auth/refresh',  // cookie solo enviada a esta ruta
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 días
  });
}

// ── Registro ────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { accessToken, refreshToken, user } =
      await authService.registerWithEmail({ email, password, name });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

// ── Login ───────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { accessToken, refreshToken, user } =
      await authService.loginWithEmail({ email, password });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.json({ user });
  } catch (err) {
    // Evitar filtrar si el error es "usuario no encontrado" vs "contraseña incorrecta"
    if (err.status === 401) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    next(err);
  }
}

// ── Logout ──────────────────────────────────────────────────
export async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ── Refresh token ───────────────────────────────────────────
export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: 'No autenticado' });

    const { accessToken } = await authService.refreshAccessToken(token);
    setAccessCookie(res, accessToken);

    res.json({ ok: true });
  } catch (err) {
    res.status(401).json({ error: 'Sesión expirada' });
  }
}

// ── Google OAuth callback ───────────────────────────────────
export async function googleCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Código de autorización requerido' });

    const { accessToken, refreshToken } =
      await authService.loginWithGoogle(code);

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    // Redirigir al dashboard tras el login
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    next(err);
  }
}

// ── Usuario actual ──────────────────────────────────────────
export async function me(req, res) {
  res.json({ user: req.user });
}
