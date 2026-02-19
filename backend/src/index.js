import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { securityMiddleware } from './middleware/security.js';
import authRoutes     from './routes/auth.js';
import plansRoutes    from './routes/plans.js';
import paymentsRoutes from './routes/payments.js';
import dashboardRoutes from './routes/dashboard.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ───────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,               // necesario para enviar cookies
}));

app.use(securityMiddleware);       // helmet + rate limiting
app.use(express.json());
app.use(cookieParser());

// ── Rutas ───────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/plans',     plansRoutes);
app.use('/api/payments',  paymentsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler global ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[lbot-backend] Servidor en http://localhost:${PORT}`);
});

export default app; // necesario para Cloudflare Workers
