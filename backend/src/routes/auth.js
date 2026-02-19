import { Router } from 'express';
import { authLimiter } from '../middleware/security.js';
import {
  register,
  login,
  logout,
  googleCallback,
  refreshToken,
  me,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Email + contraseña
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.post('/logout',   requireAuth, logout);

// JWT refresh
router.post('/refresh', refreshToken);

// Google OAuth
router.get('/google/callback', googleCallback);

// Usuario actual (usar en el frontend para verificar sesión)
router.get('/me', requireAuth, me);

export default router;
