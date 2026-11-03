import { allProducts, collections, products } from './data/catalog.mjs';
import { pages } from './data/pages.mjs';
import { buildGlobals } from './globals.mjs';
import { resolveTemplate } from './render.mjs';

/**
 * Maps a storefront URL onto a template plus the globals that template needs.
 * Returns null when nothing matches so the server can fall through to 404.
 */
export function matchRoute(pathname, { cartEmpty, query }) {
  const base = { path: pathname, cartEmpty };

  if (pathname === '/' || pathname === '/index') {
    return {
      template: 'index',
      globals: buildGlobals({
        ...base,
        template: 'index',
        pageTitle: 'MOVO Boost | Hydration without the bottle',
        pageDescription:
          'Zero-sugar, nicotine-free electrolyte pouches in Mint and Citrus. No bottle, no mixing.'
      })
    };
  }

  if (pathname === '/cart') {
    return {
      template: 'cart',
      globals: buildGlobals({ ...base, template: 'cart', pageTitle: 'Your cart' })
    };
  }

  if (pathname === '/search') {
    const terms = String(query?.get?.('q') ?? '').trim();
    const needle = terms.toLowerCase();
    const results = terms
      ? products.filter((product) => product.title.toLowerCase().includes(needle))
      : [];

    return {
      template: 'search',
      globals: buildGlobals({
        ...base,
        template: 'search',
        pageTitle: terms ? `Search: ${terms}` : 'Search',
        extra: {
          search: {
            performed: Boolean(terms),
            terms,
            results,
            results_count: results.length
          }
        }
      })
    };
  }

  if (pathname === '/password') {
    return {
      template: 'password',
      globals: buildGlobals({ ...base, template: 'password', pageTitle: 'Coming soon' })
    };
  }

  const productMatch = pathname.match(/^\/products\/([^/]+)\/?$/);
  if (productMatch) {
    const product = allProducts[productMatch[1]];
    if (!product) return null;
    return {
      template: 'product',
      globals: buildGlobals({
        ...base,
        template: 'product',
        pageTitle: product.title,
        pageDescription: product.description.replace(/<[^>]+>/g, '').slice(0, 160),
        extra: { product }
      })
    };
  }

  const collectionMatch = pathname.match(/^\/collections\/([^/]+)\/?$/);
  if (collectionMatch) {
    const collection = collections[collectionMatch[1]];
    if (!collection) return null;
    return {
      template: 'collection',
      globals: buildGlobals({
        ...base,
        template: 'collection',
        pageTitle: collection.title,
        extra: { collection }
      })
    };
  }

  const pageMatch = pathname.match(/^\/pages\/([^/]+)\/?$/);
  if (pageMatch) {
    const page = pages[pageMatch[1]];
    if (!page) return null;

    const template = resolveTemplate([`page.${page.template_suffix}`, 'page']);
    if (!template) return null;

    return {
      template,
      globals: buildGlobals({
        ...base,
        template: 'page',
        suffix: page.template_suffix,
        pageTitle: page.title,
        extra: { page }
      })
    };
  }

  return null;
}

export function notFoundRoute(pathname, { cartEmpty }) {
  return {
    template: '404',
    globals: buildGlobals({
      path: pathname,
      cartEmpty,
      template: '404',
      pageTitle: 'Page not found'
    })
  };
}

/** Everything the preview can render, shown on the index page of the harness. */
export const SITEMAP = [
  { label: 'Home', url: '/' },
  { label: 'Collection', url: '/collections/pouches' },
  { label: 'Product — Mint', url: '/products/movo-boost-mint' },
  { label: 'Product — Citrus', url: '/products/movo-boost-citrus' },
  { label: 'Build a box', url: '/pages/build-a-box' },
  { label: 'Cart', url: '/cart' },
  { label: 'Cart (empty)', url: '/cart?cart=empty' },
  { label: 'How it works', url: '/pages/how-it-works' },
  { label: 'Ingredients', url: '/pages/ingredients' },
  { label: 'Ingredient — Sodium', url: '/pages/sodium' },
  { label: 'Ingredient — Potassium', url: '/pages/potassium' },
  { label: 'Ingredient — Magnesium', url: '/pages/magnesium' },
  { label: 'Ingredient — L-Taurine', url: '/pages/l-taurine' },
  { label: 'The science', url: '/pages/science' },
  { label: 'Our story', url: '/pages/story' },
  { label: 'FAQ', url: '/pages/faq' },
  { label: 'Contact', url: '/pages/contact' },
  { label: 'Search', url: '/search' },
  { label: 'Search — Mint', url: '/search?q=mint' },
  { label: 'Password', url: '/password' },
  { label: '404', url: '/nope' }
];
