import { ACTIVES, FLAVORS, PACK_SIZES, POUCHES_PER_TIN } from './flavors.mjs';
import { sellingPlanAllocations, sellingPlanGroup } from './selling-plans.mjs';

let variantId = 42000;

/** Expands a flavor spec into the `product` object shape Liquid expects. */
function buildProduct(flavor, position) {
  const images = flavor.images.map((file, index) => ({
    id: `${flavor.handle}-image-${index}`,
    src: `/assets/${file}`,
    alt: `${flavor.title} electrolyte pouches`,
    width: 1000,
    height: 1000,
    aspect_ratio: 1
  }));

  const variants = PACK_SIZES.map((pack) => {
    const id = (variantId += 1);
    return {
      id,
      title: pack.name,
      name: `${flavor.title} - ${pack.name}`,
      sku: `MB-${flavor.flavor.slice(0, 3).toUpperCase()}-${pack.tins}`,
      price: pack.price,
      compare_at_price: pack.compareAt,
      available: true,
      inventory_quantity: 250,
      inventory_management: 'shopify',
      requires_shipping: true,
      taxable: true,
      url: `/products/${flavor.handle}?variant=${id}`,
      options: [pack.name],
      option1: pack.name,
      option2: null,
      option3: null,
      title_pack_tins: pack.tins,
      featured_image: images[0],
      featured_media: { id: images[0].id, media_type: 'image', preview_image: images[0] },
      selling_plan_allocations: sellingPlanAllocations(pack.price),
      selected_selling_plan_allocation: null,
      unit_price: null,
      metafields: {
        custom: {
          tins: { value: pack.tins },
          pouches: { value: pack.tins * POUCHES_PER_TIN }
        }
      }
    };
  });

  const prices = variants.map((variant) => variant.price);

  return {
    id: 7000 + position,
    title: flavor.title,
    handle: flavor.handle,
    url: `/products/${flavor.handle}`,
    vendor: 'MOVO Boost',
    type: 'Electrolyte pouches',
    tags: ['electrolytes', 'nicotine-free', flavor.flavor.toLowerCase()],
    description: flavor.description,
    content: flavor.description,
    available: true,
    price: prices[0],
    price_min: Math.min(...prices),
    price_max: Math.max(...prices),
    price_varies: true,
    compare_at_price: variants[0].compare_at_price,
    compare_at_price_max: Math.max(...PACK_SIZES.map((pack) => pack.compareAt ?? pack.price)),
    has_only_default_variant: false,
    requires_selling_plan: false,
    featured_image: images[0],
    featured_media: { id: images[0].id, media_type: 'image', preview_image: images[0] },
    images,
    media: images.map((image) => ({
      id: image.id,
      media_type: 'image',
      alt: image.alt,
      preview_image: image,
      src: image.src
    })),
    options: ['Pack size'],
    options_with_values: [
      {
        name: 'Pack size',
        position: 1,
        selected_value: PACK_SIZES[0].name,
        values: PACK_SIZES.map((pack) => pack.name)
      }
    ],
    variants,
    first_available_variant: variants[0],
    selected_variant: null,
    selected_or_first_available_variant: variants[0],
    selling_plan_groups: [sellingPlanGroup()],
    selected_selling_plan: null,
    selected_or_first_available_selling_plan_allocation: variants[0].selling_plan_allocations[0],
    metafields: {
      custom: {
        flavor: { value: flavor.flavor },
        accent_color: { value: flavor.accent },
        taste_note: { value: flavor.tasteNote },
        pouches_per_tin: { value: POUCHES_PER_TIN },
        actives: { value: JSON.stringify(ACTIVES) }
      }
    }
  };
}

export const products = FLAVORS.map(buildProduct);

export const allProducts = Object.fromEntries(products.map((product) => [product.handle, product]));

function collection(handle, title, members, description) {
  return {
    id: handle,
    handle,
    title,
    url: `/collections/${handle}`,
    description,
    products: members,
    all_products_count: members.length,
    products_count: members.length,
    featured_image: members[0]?.featured_image ?? null,
    all_tags: [],
    tags: [],
    sort_by: 'manual',
    default_sort_by: 'manual'
  };
}

export const collections = {
  all: collection('all', 'All products', products, '<p>Every MOVO Boost flavor.</p>'),
  pouches: collection(
    'pouches',
    'Electrolyte pouches',
    products,
    '<p>Zero-sugar, nicotine-free electrolyte pouches. Two flavors at launch.</p>'
  )
};
