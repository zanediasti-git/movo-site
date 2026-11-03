/**
 * Compact source of truth for the two launch flavors. The full Shopify
 * `product` shape is derived from this in catalog.mjs so there is only one
 * place to edit while the design is being reviewed.
 *
 * PLACEHOLDER PRICING. Real prices live in Shopify, not here — see
 * docs/admin-setup.md.
 */
export const PACK_SIZES = [
  { name: '1 Tin', tins: 1, price: 1400, compareAt: null },
  { name: '3-Pack', tins: 3, price: 3780, compareAt: 4200 },
  { name: '6-Pack', tins: 6, price: 7140, compareAt: 8400 }
];

export const POUCHES_PER_TIN = 18;

export const FLAVORS = [
  {
    handle: 'movo-boost-mint',
    title: 'MOVO Boost Mint',
    flavor: 'Mint',
    accent: '#00d9a8',
    tasteNote: 'Cold mint, clean finish',
    description:
      '<p>Zero-sugar electrolyte pouches in sharp cold mint. Slip one between lip and gum and keep going — no bottle, no shaker, no waiting for powder to dissolve.</p>',
    images: ['Pouch-m.jpg', 'Image-front.jpg', 'pouch-open-top.jpg', 'pouches-loose.jpg']
  },
  {
    handle: 'movo-boost-citrus',
    title: 'MOVO Boost Citrus',
    flavor: 'Citrus',
    accent: '#ff9f1a',
    tasteNote: 'Bright citrus, no sugar crash',
    description:
      '<p>Zero-sugar electrolyte pouches in bright citrus. Slip one between lip and gum and keep going — no bottle, no shaker, no waiting for powder to dissolve.</p>',
    images: ['Pouch-c.jpg', 'Image-front.jpg', 'pouch-open-top.jpg', 'pouches-loose.jpg']
  }
];

/** Per-pouch actives, identical across flavors. */
export const ACTIVES = [
  { name: 'Sodium', amount: 250, unit: 'mg', handle: 'sodium' },
  { name: 'Potassium', amount: 75, unit: 'mg', handle: 'potassium' },
  { name: 'Magnesium', amount: 15, unit: 'mg', handle: 'magnesium' },
  { name: 'L-Taurine', amount: 100, unit: 'mg', handle: 'l-taurine' }
];
