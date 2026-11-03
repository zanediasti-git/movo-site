import { formatMoney } from './money.mjs';
import { translate } from './translate.mjs';

/**
 * Collects liquidjs keyword filter arguments (`width: 600`, `count: 3`) into
 * one object. liquidjs 10 passes each named arg as a `[key, value]` tuple.
 */
function isNamedPair(arg) {
  return Array.isArray(arg) && arg.length === 2 && typeof arg[0] === 'string';
}

function kwargs(args) {
  return args.reduce((acc, arg) => {
    if (isNamedPair(arg)) {
      acc[arg[0]] = arg[1];
      return acc;
    }
    const isPlainObject = arg && typeof arg === 'object' && !Array.isArray(arg);
    return isPlainObject ? { ...acc, ...arg } : acc;
  }, {});
}

function positional(args) {
  return args.filter((arg) => !isNamedPair(arg) && !(arg && typeof arg === 'object' && !Array.isArray(arg)));
}

/** Resolves an image-ish Liquid value down to a local asset path. */
function imageSource(input) {
  if (!input) return '';
  if (typeof input === 'string') return input.startsWith('/') ? input : `/assets/${input}`;
  if (input.src) return input.src;
  if (input.preview_image?.src) return input.preview_image.src;
  if (input.image?.src) return input.image.src;
  return '';
}

function attrs(pairs) {
  return Object.entries(pairs)
    .filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== false)
    .map(([key, value]) => (value === true ? key : `${key}="${String(value).replace(/"/g, '&quot;')}"`))
    .join(' ');
}

export function handleize(input) {
  return String(input ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function registerFilters(engine) {
  // --- Money -------------------------------------------------------------
  engine.registerFilter('money', (cents) => formatMoney(cents));
  engine.registerFilter('money_with_currency', (cents) => formatMoney(cents, { currency: true }));
  engine.registerFilter('money_without_currency', (cents) => formatMoney(cents).replace('$', ''));
  engine.registerFilter('money_without_trailing_zeros', (cents) =>
    formatMoney(cents, { trailingZeros: false })
  );

  // --- URLs --------------------------------------------------------------
  const assetPath = (name) => `/assets/${String(name ?? '').replace(/^\/+/, '')}`;
  engine.registerFilter('asset_url', assetPath);
  engine.registerFilter('asset_img_url', assetPath);
  engine.registerFilter('file_url', assetPath);
  engine.registerFilter('file_img_url', assetPath);
  engine.registerFilter('shopify_asset_url', assetPath);
  engine.registerFilter('global_asset_url', assetPath);
  engine.registerFilter('image_url', (input) => imageSource(input));
  engine.registerFilter('img_url', (input) => imageSource(input));
  engine.registerFilter('url_for_type', (type) => `/collections/${handleize(type)}`);
  engine.registerFilter('url_for_vendor', (vendor) => `/collections/${handleize(vendor)}`);
  engine.registerFilter('within', (url) => url);
  engine.registerFilter('link_to', (text, url) => `<a href="${url}">${text}</a>`);

  // --- HTML tag helpers --------------------------------------------------
  engine.registerFilter('stylesheet_tag', (url) => `<link rel="stylesheet" href="${url}">`);
  engine.registerFilter('script_tag', (url) => `<script src="${url}" defer></script>`);
  engine.registerFilter('preload_tag', () => '');

  engine.registerFilter('img_tag', (url, ...args) => {
    const [alt = '', className = ''] = positional(args);
    return `<img ${attrs({ src: url, alt, class: className, loading: 'lazy' })}>`;
  });

  engine.registerFilter('image_tag', (input, ...args) => {
    const options = kwargs(args);
    const src = imageSource(input);
    return `<img ${attrs({
      src,
      alt: options.alt ?? input?.alt ?? '',
      class: options.class,
      width: options.width ?? input?.width,
      height: options.height ?? input?.height,
      sizes: options.sizes,
      loading: options.loading ?? 'lazy',
      decoding: 'async'
    })}>`;
  });

  // --- Text --------------------------------------------------------------
  engine.registerFilter('t', (key, ...args) => translate(key, kwargs(args)));
  engine.registerFilter('handleize', handleize);
  engine.registerFilter('handle', handleize);
  engine.registerFilter('camelize', (input) =>
    String(input ?? '').replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
  );
  engine.registerFilter('json', (input) => JSON.stringify(input ?? null));
  engine.registerFilter('weight_with_unit', (grams, unit = 'g') => `${grams} ${unit}`);
  engine.registerFilter('pluralize', (count, one, other) => (Number(count) === 1 ? one : other));
  engine.registerFilter('highlight', (text) => text);
  engine.registerFilter('placeholder_svg_tag', (name, className = '') =>
    `<svg class="${className}" role="img" aria-label="${name}" viewBox="0 0 100 100"><rect width="100" height="100" fill="currentColor" opacity=".08"/></svg>`
  );
  engine.registerFilter('payment_type_svg_tag', () => '');
  engine.registerFilter('inline_asset_content', () => '');
  engine.registerFilter('metafield_text', (field) => (field && field.value) ?? field ?? '');
  engine.registerFilter('metafield_tag', (field) => (field && field.value) ?? field ?? '');
  engine.registerFilter('structured_data', () => '');
  engine.registerFilter('default_errors', (errors) => {
    if (!errors) return '';
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) return errors.join(' ');
    if (typeof errors === 'object') return Object.values(errors).flat().join(' ');
    return String(errors);
  });
}
