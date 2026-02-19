import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { webhookLimiter } from '../middleware/security.js';
import {
  createStripeSession,
  createPaypalOrder,
  createCryptoInvoice,
  stripeWebhook,
  paypalWebhook,
  cryptoWebhook,
} from '../controllers/paymentController.js';

const router = Router();

// ── Crear pagos (requiere auth) ─────────────────────────────
router.post('/stripe/create',  requireAuth, createStripeSession);
router.post('/paypal/create',  requireAuth, createPaypalOrder);
router.post('/crypto/create',  requireAuth, createCryptoInvoice);

// ── Webhooks (sin auth — validación interna con firma) ──────
// express.raw() necesario para verificar la firma de Stripe
router.post(
  '/stripe/webhook',
  webhookLimiter,
  (req, res, next) => {
    // Preservar el body raw para verificación de firma
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { req.rawBody = data; next(); });
  },
  stripeWebhook,
);

router.post('/paypal/webhook', webhookLimiter, paypalWebhook);
router.post('/crypto/webhook', webhookLimiter, cryptoWebhook);

export default router;
