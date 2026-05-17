'use strict';

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const rateLimit = require('express-rate-limit');
const orderService = require('../services/orderService');
const { getById, getBySlug, computeOrderTotal } = require('../catalog');
const { isProcessed, markProcessed } = require('../utils/idempotency');

// ─── Rate limiters ───────────────────────────────────────────────────────────
// Prevents spam that would consume AI quota without payment.
// Limits are per IP; generous enough for legitimate use, tight enough to block bots.

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 sessions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Твърде много заявки. Моля опитайте след малко.' },
});

const upsellLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                   // slightly higher — upsell can be revisited more often
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Твърде много заявки. Моля опитайте след малко.' },
});

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY не е конфигуриран');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ─── helpers ─────────────────────────────────────────────────────────────────
function ids(itemIds) {
  return (itemIds || []).map((id) => String(id));
}

function describeOrder(itemIds) {
  return itemIds
    .map((id) => getById(id))
    .filter(Boolean)
    .map((i) => i.title)
    .join(' + ');
}

function emailRegex(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// ─── POST /api/payments/create-checkout-session ─────────────────────────────
// New format:  { itemIds: [1, 'B2', 'B4'], customerData, email, applyBundleDiscount? }
// Legacy:      { productType, customerData, email, priceEur, addOns? }
router.post('/create-checkout-session', checkoutLimiter, async (req, res) => {
  try {
    const { customerData, email } = req.body;

    if (!customerData || !email) {
      return res.status(400).json({ success: false, error: 'Липсват customerData или email.' });
    }
    if (!emailRegex(email)) {
      return res.status(400).json({ success: false, error: 'Невалиден имейл адрес.' });
    }

    // Normalize input → itemIds array
    let itemIds = ids(req.body.itemIds);
    if (itemIds.length === 0 && req.body.productType) {
      // Legacy fallback
      const main = getBySlug(req.body.productType);
      if (main) itemIds.push(String(main.id));
      for (const addOn of req.body.addOns || []) {
        const item = getBySlug(addOn);
        if (item) itemIds.push(String(item.id));
      }
    }
    if (itemIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Поне един продукт е задължителен.' });
    }
    // Validate all ids resolve
    for (const id of itemIds) {
      if (!getById(id)) {
        return res.status(400).json({ success: false, error: `Неизвестен продукт: ${id}` });
      }
    }

    const applyBundleDiscount = !!req.body.applyBundleDiscount;
    const totals = computeOrderTotal(itemIds, { applyBundleDiscount });

    // Use server-computed price (never trust client-side priceEur)
    const finalPriceEur = totals.total;
    if (finalPriceEur < 0.5) {
      return res.status(400).json({ success: false, error: 'Невалидна цена.' });
    }

    // Stripe metadata limits: max 50 keys, each value <= 500 chars
    const customerDataStr = JSON.stringify(customerData);
    if (customerDataStr.length > 490) {
      return res.status(400).json({ success: false, error: 'Данните за клиента са твърде дълги.' });
    }
    const itemIdsStr = itemIds.join(',');
    if (itemIdsStr.length > 490) {
      return res.status(400).json({ success: false, error: 'Твърде много продукти в една поръчка.' });
    }

    // Build a friendly Stripe product label
    const orderLabel = describeOrder(itemIds) || 'Астрологичен Анализ';
    const description = itemIds.length > 1
      ? `${itemIds.length} персонални анализа — Астро ОС`
      : 'Персонален AI астрологичен анализ — Астро ОС';

    const firstSlug = getById(itemIds[0])?.slug || '';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: orderLabel, description },
          unit_amount: Math.round(finalPriceEur * 100),
        },
        quantity: 1,
      }],
      metadata: {
        itemIds: itemIdsStr,
        email,
        customerData: customerDataStr,
      },
      success_url: `https://astro-os.net/upsell?session_id={CHECKOUT_SESSION_ID}&product=${encodeURIComponent(firstSlug)}&email=${encodeURIComponent(email)}`,
      cancel_url: `https://astro-os.net/deep-analyses`,
    });

    res.json({ url: session.url, totals });
  } catch (err) {
    console.error('[Payments] create-checkout-session error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/payments/create-upsell-session ───────────────────────────────
// New format: { originalSessionId, itemIds: [4, 'B2'], applyBundleDiscount }
// Legacy:     { originalSessionId, productType, productLabel, priceEur }
router.post('/create-upsell-session', upsellLimiter, async (req, res) => {
  try {
    const { originalSessionId } = req.body;
    if (!originalSessionId) {
      return res.status(400).json({ success: false, error: 'Липсва originalSessionId.' });
    }

    const original = await getStripe().checkout.sessions.retrieve(originalSessionId);
    const { email, customerData: originalCustomerDataStr } = original.metadata || {};
    if (!email || !originalCustomerDataStr) {
      return res.status(400).json({ success: false, error: 'Не може да се намери оригиналната поръчка.' });
    }

    // Merge extraCustomerData (e.g. { u3Bumps: ['B1','B4','B5'] }) into the original
    let mergedCustomerData = originalCustomerDataStr;
    if (req.body.extraCustomerData && typeof req.body.extraCustomerData === 'object') {
      try {
        const parsed = JSON.parse(originalCustomerDataStr);
        const merged = { ...parsed, ...req.body.extraCustomerData };
        mergedCustomerData = JSON.stringify(merged);
      } catch (e) {
        console.warn('[Payments] upsell: failed to merge extraCustomerData:', e.message);
      }
    }
    const customerData = mergedCustomerData;

    // Normalize itemIds (new format) or fallback to legacy productType
    let itemIds = ids(req.body.itemIds);
    if (itemIds.length === 0 && req.body.productType) {
      const item = getBySlug(req.body.productType);
      if (item) itemIds.push(String(item.id));
    }
    if (itemIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Поне един продукт е задължителен.' });
    }
    for (const id of itemIds) {
      if (!getById(id)) {
        return res.status(400).json({ success: false, error: `Неизвестен продукт: ${id}` });
      }
    }

    const applyBundleDiscount = !!req.body.applyBundleDiscount;
    const totals = computeOrderTotal(itemIds, { applyBundleDiscount });
    const finalPriceEur = totals.total;
    if (finalPriceEur < 0.5) {
      return res.status(400).json({ success: false, error: 'Невалидна цена.' });
    }

    const itemIdsStr = itemIds.join(',');
    if (itemIdsStr.length > 490) {
      return res.status(400).json({ success: false, error: 'Твърде много продукти в една поръчка.' });
    }

    const orderLabel = describeOrder(itemIds) || 'Допълнителен анализ';
    const description = itemIds.length > 1
      ? `${itemIds.length} допълнителни анализа — Астро ОС`
      : 'Допълнителен AI астрологичен анализ — Астро ОС';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: orderLabel, description },
          unit_amount: Math.round(finalPriceEur * 100),
        },
        quantity: 1,
      }],
      metadata: {
        itemIds: itemIdsStr,
        email,
        customerData,
      },
      success_url: `https://astro-os.net/thank-you`,
      cancel_url: `https://astro-os.net/thank-you`,
    });

    res.json({ url: session.url, totals });
  } catch (err) {
    console.error('[Payments] create-upsell-session error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/payments/webhook ─────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!WEBHOOK_SECRET) {
    console.warn('[Payments] STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Payments] Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency — Stripe retries on network errors / non-2xx; skip duplicates.
  if (isProcessed(event.id)) {
    console.log(`[Payments] Webhook: skipping duplicate event ${event.id} (${event.type})`);
    return res.json({ received: true, duplicate: true });
  }
  // Mark BEFORE processing so a crash mid-process doesn't lead to retry-loop
  // (we'd rather drop one delivery than double-charge). processOrder itself
  // logs failures so we can manually recover if needed.
  markProcessed(event.id);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};

    // New format
    let itemIds = (meta.itemIds || '').split(',').map((s) => s.trim()).filter(Boolean);
    // Legacy fallback
    if (itemIds.length === 0 && meta.productType) {
      const main = getBySlug(meta.productType);
      if (main) itemIds.push(String(main.id));
      const legacyAddOns = (meta.addOns || '').split(',').map((s) => s.trim()).filter(Boolean);
      for (const slug of legacyAddOns) {
        const item = getBySlug(slug);
        if (item) itemIds.push(String(item.id));
      }
    }

    if (itemIds.length === 0 || !meta.email || !meta.customerData) {
      console.error('[Payments] Webhook: missing metadata', session.id, meta);
      return res.json({ received: true });
    }

    let customerData;
    try {
      customerData = JSON.parse(meta.customerData);
    } catch {
      console.error('[Payments] Webhook: failed to parse customerData JSON');
      return res.json({ received: true });
    }

    console.log(`[Payments] Webhook: processing order ${itemIds.join(',')} for ${meta.email}`);

    // Fire and forget — webhook should respond fast
    orderService.processOrder({
      itemIds,
      customerData,
      email: meta.email,
    }).catch((err) => {
      console.error('[Payments] Webhook processOrder error:', err.message);
    });
  }

  res.json({ received: true });
});

module.exports = router;
