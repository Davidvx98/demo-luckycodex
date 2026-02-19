/**
 * paymentService.js
 *
 * Lógica de negocio de pagos.
 * STUB — implementación completa en Fase 5 (Pagos).
 *
 * Lo que implementará esta fase:
 * - Crear sesión Stripe Checkout
 * - Crear orden PayPal
 * - Crear factura NowPayments (crypto)
 * - Verificar firma de cada webhook
 * - Activar plan del usuario en D1 tras pago confirmado
 */

// TODO Fase 5: implementar con Stripe SDK, PayPal REST API, NowPayments API

export async function createStripeCheckout({ userId, planId }) {
  throw new Error('Not implemented — Fase 5');
}

export async function createPaypalOrder({ userId, planId }) {
  throw new Error('Not implemented — Fase 5');
}

export async function createCryptoInvoice({ userId, planId }) {
  throw new Error('Not implemented — Fase 5');
}

export async function handleStripeWebhook(rawBody, signature) {
  throw new Error('Not implemented — Fase 5');
}

export async function handlePaypalWebhook(body, headers) {
  throw new Error('Not implemented — Fase 5');
}

export async function handleCryptoWebhook(body, signature) {
  throw new Error('Not implemented — Fase 5');
}
