import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG_DIR } from './paths.mjs';
import { allProducts, collections, products } from './data/catalog.mjs';
import { pages } from './data/pages.mjs';
import { buildCart, linklists, routes, shop } from './data/shop.mjs';

/** Theme settings come from the same file the theme editor writes to. */
function themeSettings() {
  const file = JSON.parse(readFileSync(join(CONFIG_DIR, 'settings_data.json'), 'utf8'));
  return file.current ?? {};
}

export function buildGlobals({
  template,
  suffix = '',
  pageTitle,
  pageDescription = '',
  path = '/',
  cartEmpty = false,
  extra = {}
}) {
  return {
    shop,
    routes,
    linklists,
    settings: themeSettings(),
    cart: buildCart({ empty: cartEmpty }),
    collections,
    all_products: allProducts,
    pages,
    template: { name: template, suffix, directory: '' },
    request: {
      locale: { iso_code: 'en', endonym_name: 'English', primary: true },
      page_type: template,
      design_mode: false,
      host: 'localhost:5174',
      origin: 'http://localhost:5174',
      path
    },
    localization: {
      language: { iso_code: 'en', endonym_name: 'English' },
      country: { iso_code: 'US', name: 'United States', currency: { iso_code: 'USD' } },
      available_countries: [],
      available_languages: []
    },
    canonical_url: `http://localhost:5174${path}`,
    page_title: pageTitle ?? shop.name,
    page_description: pageDescription,
    current_page: 1,
    current_tags: null,
    content_for_header: '<!-- preview: content_for_header is injected by Shopify -->',
    powered_by_link: '',
    additional_checkout_buttons: false,
    featured_products: products,
    search: {
      performed: false,
      terms: '',
      results: [],
      results_count: 0
    },
    ...extra
  };
}
