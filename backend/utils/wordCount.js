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
  maxTokens,
  minWords,
  label = 'unknown',
}) {
  const threshold = Math.floor(minWords * MIN_WORD_RATIO);

  // First attempt
  let text = await generateText(system, prompt, { maxTokens });
  let count = countWords(text);

  console.log(`${LOG_PREFIX} ${label}: first pass = ${count} words (target ${minWords}, threshold ${threshold})`);

  if (count >= threshold) {
    return { text, wordCount: count, retried: false, targetMet: true };
  }

  // Retry with explicit expansion instruction
  console.warn(`${LOG_PREFIX} ${label}: too short — retrying with expansion request`);

  const expandPrompt = `${prompt}

⚠️ ВАЖНО — ПРЕДИШЕН ОПИТ БЕШЕ ТВЪРДЕ КРАТЪК (${count} думи вместо целта ${minWords})

Ето черновата:
"""
${text}
"""

Разшири я до МИНИМУМ ${minWords} думи, като:
— Добавиш повече конкретни примери и детайли
— Развиеш всеки параграф с поне 30-40% повече съдържание
— НЕ съкращаваш и НЕ повтаряш — добавяй НОВО съдържание
— Запазваш структурата и тона

Върни ПЪЛНИЯ разширен текст, не само добавките.`;

  const text2 = await generateText(system, expandPrompt, { maxTokens });
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
