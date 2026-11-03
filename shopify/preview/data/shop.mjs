import { products } from './catalog.mjs';

export const shop = {
  name: 'MOVO Boost',
  description: 'Zero-sugar, nicotine-free electrolyte pouches. Hydration without the bottle.',
  url: 'http://localhost:5174',
  secure_url: 'http://localhost:5174',
  domain: 'localhost:5174',
  permanent_domain: 'movo-boost.myshopify.com',
  email: 'hello@movoboost.com',
  money_format: '${{amount}}',
  currency: 'USD',
  enabled_payment_types: ['visa', 'master', 'american_express', 'shopify_pay'],
  privacy_policy: { url: '/policies/privacy-policy', title: 'Privacy policy' },
  terms_of_service: { url: '/policies/terms-of-service', title: 'Terms of service' },
  refund_policy: { url: '/policies/refund-policy', title: 'Refund policy' },
  shipping_policy: { url: '/policies/shipping-policy', title: 'Shipping policy' }
};

export const routes = {
  root_url: '/',
  account_url: '/account',
  account_login_url: '/account/login',
  account_logout_url: '/account/logout',
  account_register_url: '/account/register',
  account_addresses_url: '/account/addresses',
  collections_url: '/collections',
  all_products_collection_url: '/collections/all',
  search_url: '/search',
  predictive_search_url: '/search/suggest',
  cart_url: '/cart',
  cart_add_url: '/cart/add',
  cart_change_url: '/cart/change',
  cart_clear_url: '/cart/clear',
  cart_update_url: '/cart/update'
};

function link(title, url, handle) {
  return { title, url, handle, active: false, type: 'http_link', links: [], levels: 0 };
}

export const linklists = {
  'main-menu': {
    title: 'Main menu',
    handle: 'main-menu',
    levels: 1,
    links: [
      link('Shop', '/collections/pouches', 'shop'),
      link('Build a box', '/pages/build-a-box', 'build-a-box'),
      link('How it works', '/pages/how-it-works', 'how-it-works'),
      link('Ingredients', '/pages/ingredients', 'ingredients'),
      link('The science', '/pages/science', 'science'),
      link('Our story', '/pages/story', 'story')
    ]
  },
  footer: {
    title: 'Footer',
    handle: 'footer',
    levels: 1,
    links: [
      link('Shop', '/collections/pouches', 'shop'),
      link('Build a box', '/pages/build-a-box', 'build-a-box'),
      link('How it works', '/pages/how-it-works', 'how-it-works'),
      link('Ingredients', '/pages/ingredients', 'ingredients'),
      link('The science', '/pages/science', 'science'),
      link('Our story', '/pages/story', 'story'),
      link('FAQ', '/pages/faq', 'faq'),
      link('Contact', '/pages/contact', 'contact')
    ]
  }
};

/**
 * Two line items so the drawer, shipping progress bar and cart page all have
 * something to render. `?cart=empty` on any URL renders the empty state.
 */
export function buildCart({ empty = false } = {}) {
  if (empty) {
    return {
      item_count: 0,
      items: [],
      total_price: 0,
      original_total_price: 0,
      total_discount: 0,
      items_subtotal_price: 0,
      currency: 'USD',
      attributes: {},
      cart_level_discount_applications: []
    };
  }

  const [mint, citrus] = products;
  const items = [
    lineItem(mint, mint.variants[1], 1),
    lineItem(citrus, citrus.variants[0], 2, citrus.variants[0].selling_plan_allocations[0])
  ];
  const total = items.reduce((sum, item) => sum + item.final_line_price, 0);

  return {
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    total_price: total,
    original_total_price: total,
    total_discount: 0,
    items_subtotal_price: total,
    currency: 'USD',
    attributes: {},
    cart_level_discount_applications: []
  };
}

function lineItem(product, variant, quantity, allocation = null) {
  const unit = allocation ? allocation.price : variant.price;
  return {
    id: variant.id,
    key: `${variant.id}:preview`,
    product,
    product_id: product.id,
    product_title: product.title,
    product_has_only_default_variant: false,
    variant,
    variant_id: variant.id,
    variant_title: variant.title,
    title: `${product.title} - ${variant.title}`,
    url: variant.url,
    image: product.featured_image,
    quantity,
    price: unit,
    original_price: variant.price,
    final_price: unit,
    line_price: unit * quantity,
    original_line_price: variant.price * quantity,
    final_line_price: unit * quantity,
    properties: {},
    selling_plan_allocation: allocation,
    line_level_discount_allocations: [],
    options_with_values: [{ name: 'Pack size', value: variant.title }]
  };
}
