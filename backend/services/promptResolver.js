'use strict';

const { PRODUCT_PROMPTS } = require('../prompts/productPrompts');
const { BUMP_PROMPTS } = require('../prompts/bumpPrompts');
const { DOWNSELL_PROMPTS } = require('../prompts/downsellPrompts');
const { getById } = require('../catalog');

const ALL_PROMPTS = {
  ...PRODUCT_PROMPTS,
  ...BUMP_PROMPTS,
  ...DOWNSELL_PROMPTS,
};

/**
 * Resolve a catalog itemId → { system, prompt, maxTokens, minWords, catalogItem }.
 * Throws if itemId is unknown or has no prompt registered.
 */
function resolveItemPrompt(itemId, data) {
  const item = getById(itemId);
  if (!item) {
    throw new Error(`promptResolver: unknown catalog id "${itemId}"`);
  }
  if (item.kind === 'upsell') {
    // Upsells are composed of other items — not resolved as a single prompt.
    throw new Error(`promptResolver: upsell "${itemId}" must be expanded into its parts first`);
  }
  if (item.kind === 'main' && item.slug === 'synastry') {
    // Synastry has a dedicated flow in orderService (uses synastryService).
    throw new Error(`promptResolver: synastry must use runSynastryFlow, not resolveItemPrompt`);
  }

  const fn = ALL_PROMPTS[item.promptKey];
  if (typeof fn !== 'function') {
    throw new Error(`promptResolver: no prompt registered for promptKey "${item.promptKey}" (item ${itemId})`);
  }

  const { system, prompt } = fn(data);
  return {
    system,
    prompt,
    maxTokens: item.maxTokens,
    minWords: item.minWords,
    catalogItem: item,
  };
}

/**
 * Expand an order's itemIds: if any item is a composed upsell (U3 = #9 + 3 bumps),
 * replace it with its concrete sub-items.
 * U3 uses customerData.u3Bumps = ['B2', 'B4', 'B5']  (chosen at upsell checkout).
 */
function expandOrderItems(itemIds, customerData = {}) {
  const expanded = [];
  for (const id of itemIds) {
    const item = getById(id);
    if (!item) continue;

    if (item.kind === 'upsell' && item.composedOf) {
      const { main, pickBumps } = item.composedOf;
      // Add the main
      const mainItem = require('../catalog').getBySlug(main);
      if (mainItem) expanded.push(mainItem.id);
      // Add the chosen bumps (pickBumps = number; customerData.u3Bumps = the choices)
      const chosenBumps = Array.isArray(customerData.u3Bumps) ? customerData.u3Bumps : [];
      const validBumps = chosenBumps.slice(0, pickBumps || chosenBumps.length);
      expanded.push(...validBumps);
    } else {
      expanded.push(id);
    }
  }
  // Dedupe preserving order
  const seen = new Set();
  return expanded.filter((id) => {
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { resolveItemPrompt, expandOrderItems, ALL_PROMPTS };
