/**
 * paymentController.js
 *
 * Solo orquesta la request/response.
 * La lógica real (crear órdenes, verificar firmas) va en paymentService.js.
 *
 * REGLA: Nunca se confirma un pago desde el frontend.
 * Solo los webhooks firmados por el proveedor activan el plan.
 */

import * as paymentService from '../services/paymentService.js';

// ── Crear sesión de pago Stripe ─────────────────────────────
export async function createStripeSession(req, res, next) {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: 'planId requerido' });

    const { url } = await paymentService.createStripeCheckout({
      userId: req.user.id,
      planId,
    });

    res.json({ url }); // Frontend redirige a Stripe Checkout
  } catch (err) {
    next(err);
  }
}

// ── Crear orden PayPal ──────────────────────────────────────
export async function createPaypalOrder(req, res, next) {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: 'planId requerido' });

    const { approvalUrl } = await paymentService.createPaypalOrder({
      userId: req.user.id,
      planId,
    });

    res.json({ url: approvalUrl });
  } catch (err) {
    next(err);
  }
}

// ── Crear factura crypto ────────────────────────────────────
export async function createCryptoInvoice(req, res, next) {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: 'planId requerido' });

    const { invoiceUrl } = await paymentService.createCryptoInvoice({
      userId: req.user.id,
      planId,
    });

    res.json({ url: invoiceUrl });
  } catch (err) {
    next(err);
  }
}

// ── Webhook Stripe ──────────────────────────────────────────
export async function stripeWebhook(req, res, next) {
  try {
    const signature = req.headers['stripe-signature'];
    await paymentService.handleStripeWebhook(req.rawBody, signature);
    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe webhook]', err.message);
    return res.status(400).json({ error: err.message });
  }
}

// ── Webhook PayPal ──────────────────────────────────────────
export async function paypalWebhook(req, res, next) {
  try {
    await paymentService.handlePaypalWebhook(req.body, req.headers);
    res.json({ received: true });
  } catch (err) {
    console.error('[PayPal webhook]', err.message);
    return res.status(400).json({ error: err.message });
  }
}

// ── Webhook Crypto ──────────────────────────────────────────
export async function cryptoWebhook(req, res, next) {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    await paymentService.handleCryptoWebhook(req.body, signature);
    res.json({ received: true });
  } catch (err) {
    console.error('[Crypto webhook]', err.message);
    return res.status(400).json({ error: err.message });
  }
}
