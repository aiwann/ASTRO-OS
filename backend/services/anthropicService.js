'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const db = require('../database/db');
const { decrypt } = require('../utils/encryption');

async function getClient() {
  // Ако има ENV variable (Railway/production) — използвай директно
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
    };
  }
  // Fallback: чети от DB (Electron desktop app)
  const row = await db.prepare('SELECT encrypted_api_key, encryption_iv, model FROM settings WHERE id = 1').get();
  if (!row || !row.encrypted_api_key) {
    throw new Error('API ключът не е конфигуриран. Моля, добавете го в Настройки.');
  }
  const apiKey = decrypt(row.encrypted_api_key, row.encryption_iv);
  return {
    client: new Anthropic({ apiKey }),
    model: row.model || 'claude-sonnet-4-5',
  };
}

async function generateText(systemPrompt, userPrompt, options = {}) {
  const { client, model } = await getClient();
  const selectedModel = options.model || model;
  const maxTokens = options.maxTokens || 2000;

  // Extended output beta required for > 8192 tokens (enables up to 128K)
  const params = {
    model: selectedModel,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  };
  if (maxTokens > 8192) {
    params.betas = ['output-128k-2025-02-19'];
  }

  // Use streaming accumulation for large outputs to avoid HTTP timeout
  if (maxTokens > 8192) {
    let text = '';
    const stream = client.messages.stream(params);
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        text += chunk.delta.text;
      }
    }
    return text;
  }

  const message = await client.messages.create(params);
  return message.content[0].text;
}

async function generateSection(sectionKey, sectionConfig, res) {
  const { client, model } = await getClient();
  return generateSectionWithClient(client, model, sectionKey, sectionConfig, res);
}

/**
 * Генерира секция с предварително създаден client (без DB lookup).
 * Използва се при паралелна генерация — client се извлича веднъж,
 * после се подава на всички паралелни заявки.
 */
async function generateSectionWithClient(client, model, sectionKey, sectionConfig, res) {
  res.write(`data: ${JSON.stringify({ type: 'section_start', section: sectionKey })}\n\n`);

  let fullText = '';

  const stream = client.messages.stream({
    model,
    max_tokens: 2500,
    system: sectionConfig.system,
    messages: [{ role: 'user', content: sectionConfig.prompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      const text = chunk.delta.text;
      fullText += text;
      res.write(`data: ${JSON.stringify({ type: 'text_delta', section: sectionKey, text })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ type: 'section_complete', section: sectionKey, text: fullText })}\n\n`);
  return fullText;
}

async function streamChat(messages, reportContext, res) {
  const { client, model } = await getClient();
  const { MASTER_SYSTEM_PROMPT } = require('../prompts/systemPrompt');

  const systemWithContext = `${MASTER_SYSTEM_PROMPT}

КОНТЕКСТ НА ТЕКУЩИЯ ДОКЛАД:
${reportContext}

Ти помагаш на потребителя да редактира и подобрява своя астрологичен доклад. Отговаряй конкретно на заявките им. Ако молбата е за пренаписване, предоставяй готов текст.`;

  const stream = client.messages.stream({
    model,
    max_tokens: 2000,
    system: systemWithContext,
    messages,
  });

  let fullText = '';

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      const text = chunk.delta.text;
      fullText += text;
      res.write(`data: ${JSON.stringify({ type: 'text_delta', text })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ type: 'complete', text: fullText })}\n\n`);
  return fullText;
}

async function rewriteSection(instruction, currentText, reportContext) {
  const { client, model } = await getClient();
  const { MASTER_SYSTEM_PROMPT } = require('../prompts/systemPrompt');

  const message = await client.messages.create({
    model,
    max_tokens: 2500,
    system: `${MASTER_SYSTEM_PROMPT}

КОНТЕКСТ: Пренаписваш секция от астрологичен доклад по инструкция на потребителя.`,
    messages: [{
      role: 'user',
      content: `ИНСТРУКЦИЯ: ${instruction}

ТЕКУЩ ТЕКСТ:
${currentText}

КОНТЕКСТ НА ДОКЛАДА:
${reportContext}

Пренапиши текста следвайки инструкцията. Върни САМО новия текст без обяснения.`,
    }],
  });

  return message.content[0].text;
}

async function testConnection(apiKey) {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Кажи "Връзката е успешна" на български.' }],
  });
  return message.content[0].text;
}

module.exports = { generateText, generateSection, generateSectionWithClient, getClient, streamChat, rewriteSection, testConnection };
