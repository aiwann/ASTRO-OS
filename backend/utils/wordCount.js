'use strict';

const { generateText } = require('../services/anthropicService');
const { MIN_WORD_RATIO } = require('../catalog');

const LOG_PREFIX = '[WordCount]';

/**
 * Count words in a string (BG-aware: handles cyrillic + latin).
 * A "word" = sequence of letters/digits separated by whitespace or punctuation.
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.length : 0;
}

/**
 * Generate text with automatic retry if output is shorter than minWords * MIN_WORD_RATIO.
 * Up to 1 retry — second call asks AI to expand the existing draft.
 *
 * Returns: { text, wordCount, retried, targetMet }
 */
async function generateWithMinWords({
  system,
  prompt,
  cachedContext,
  maxTokens,
  minWords,
  model,
  label = 'unknown',
}) {
  const threshold = Math.floor(minWords * MIN_WORD_RATIO);
  const callOpts = { maxTokens, cachedContext, model };

  // First attempt
  let text = await generateText(system, prompt, callOpts);
  let count = countWords(text);

  console.log(`${LOG_PREFIX} ${label}: first pass = ${count} words (target ${minWords}, threshold ${threshold})`);

  if (count >= threshold) {
    return { text, wordCount: count, retried: false, targetMet: true };
  }

  // Retry — regenerate from scratch with a stronger length directive prepended.
  // We deliberately do NOT echo the previous draft back: doubling input tokens
  // rarely improved output and the AI tended to just pad existing prose.
  // Asking for a fresh attempt with stricter length target gives better results.
  console.warn(`${LOG_PREFIX} ${label}: too short — retrying (fresh) with stricter length target`);

  const expandPrompt = `${prompt}

⚠️ КРИТИЧНО ИЗИСКВАНЕ ЗА ДЪЛЖИНА:
Предишен опит даде само ${count} думи — НЕДОСТАТЪЧНО.
ТРЯБВА да генерираш МИНИМУМ ${minWords} думи (целта е ${Math.round(minWords * 1.1)}).
Развий всеки параграф с конкретни примери, детайли и дълбочина. Не повтаряй — обогатявай.`;

  const text2 = await generateText(system, expandPrompt, callOpts);
  const count2 = countWords(text2);

  console.log(`${LOG_PREFIX} ${label}: retry pass = ${count2} words`);

  // Pick whichever is closer to target (in case retry shrinks)
  if (count2 >= count) {
    return {
      text: text2,
      wordCount: count2,
      retried: true,
      targetMet: count2 >= threshold,
    };
  }
  return { text, wordCount: count, retried: true, targetMet: false };
}

module.exports = { countWords, generateWithMinWords };
