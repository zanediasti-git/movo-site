import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LOCALES_DIR } from '../paths.mjs';

/**
 * Minimal stand-in for Shopify's `t` filter: dotted key lookup against
 * locales/en.default.json, `count`-based pluralization, and {{ var }}
 * interpolation of the named arguments.
 */
export function translate(key, args = {}) {
  if (typeof key !== 'string') return '';

  const dictionary = loadLocale();
  let entry = key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);

  if (entry && typeof entry === 'object') {
    const count = Number(args.count);
    entry = Number.isFinite(count) && count === 1 ? entry.one : entry.other ?? entry.one;
  }

  if (typeof entry !== 'string') return `translation missing: ${key}`;

  return entry.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(args, name) ? String(args[name]) : match
  );
}

let cached;

function loadLocale() {
  // Re-read on every request so locale edits show up without a restart.
  if (process.env.NODE_ENV === 'production' && cached) return cached;
  cached = JSON.parse(readFileSync(join(LOCALES_DIR, 'en.default.json'), 'utf8'));
  return cached;
}
