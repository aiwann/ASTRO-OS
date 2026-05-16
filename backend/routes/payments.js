'use strict';

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const orderService = require('../services/orderService');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY не е конфигуриран');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const PRODUCT_LABELS = {
  'personal-profile':  'Личен AI Анализ',
  'synastry':          'Любовна Съвместимост',
  'yearly-analysis':   'Годишен Анализ',
  'archetype-profile': 'Архетип Профил',
  'life-map':          'Карта на Живота',
  'hidden-potential':  'Скрит Потенциал',
  'energy-profile':    'Енергиен Профил',
  'ideal-partner':     'Идеален Партньор',
  'full-life-code':    'Пълен Животен Код',
};

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  const { productType, customerData, email, priceEur, addOns = [] } = req.body;

  if (!productType || !customerData || !email || !priceEur) {
    return res.status(400).json({
      success: false,
      error: 'Липсват задължителни полета: productType, customerData, email, priceEur',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Невалиден имейл адрес.' });
  }

  try {
    const customerDataStr = JSON.stringify(customerData);
    if (customerDataStr.length > 490) {
      return res.status(400).json({ success: false, error: 'Данните за клиента са твърде дълги.' });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: PRODUCT_LABELS[productType] || productType,
              description: 'Персонален AI астрологичен анализ — Астро ОС',
            },
            unit_amount: Math.round(priceEur * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        productType,
        email,
        customerData: customerDataStr,
        addOns: addOns.join(','),
      },
      success_url: `https://astro-os.net/upsell?session_id={CHECKOUT_SESSION_ID}&product=${productType}&email=${encodeURIComponent(email)}`,
      cancel_url: `https://astro-os.net/deep-analyses`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Payments] create-checkout-session error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/create-upsell-session
router.post('/create-upsell-session', async (req, res) => {
  const { originalSessionId, productType, productLabel, priceEur } = req.body;

  if (!originalSessionId || !productType || !productLabel || !priceEur) {
    return res.status(400).json({ success: false, error: 'Липсват задължителни полета.' });
  }

  try {
    const original = await getStripe().checkout.sessions.retrieve(originalSessionId);
    const { email, customerData } = original.metadata || {};

    if (!email || !customerData) {
      return res.status(400).json({ success: false, error: 'Не може да се намери оригиналната поръчка.' });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: productLabel,
            description: 'Допълнителен AI астрологичен анализ — Астро ОС',
          },
          unit_amount: Math.round(priceEur * 100),
        },
        quantity: 1,
      }],
      metadata: { productType, email, customerData },
      success_url: `https://astro-os.net/thank-you`,
      cancel_url: `https://astro-os.net/thank-you`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Payments] create-upsell-session error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/webhook
// Uses req.rawBody (set by the verify option in express.json in server.js)
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { productType, email, customerData: customerDataStr, addOns: addOnsStr } = session.metadata || {};

    if (!productType || !email || !customerDataStr) {
      console.error('[Payments] Webhook: missing metadata in session', session.id);
      return res.json({ received: true });
    }

    let customerData;
    try {
      customerData = JSON.parse(customerDataStr);
    } catch {
      console.error('[Payments] Webhook: failed to parse customerData JSON');
      return res.json({ received: true });
    }

    const addOns = addOnsStr ? addOnsStr.split(',').filter(Boolean) : [];
    console.log(`[Payments] Webhook: processing order ${productType}${addOns.length ? ' + ' + addOns.join(', ') : ''} for ${email}`);

    orderService.processOrder({ productType, customerData, email, addOns }).catch((err) => {
      console.error('[Payments] Webhook processOrder error:', err.message);
    });
  }

  res.json({ received: true });
});

module.exports = router;
