/**
 * Mirrors what the first-party Shopify Subscriptions app produces: one selling
 * plan group with a delivery-frequency option and a percentage discount.
 * The theme reads this through `product.selling_plan_groups`.
 */
const DISCOUNT_PERCENT = 15;

const FREQUENCIES = [
  { id: 6001, value: '30 days', name: 'Delivery every 30 days' },
  { id: 6002, value: '60 days', name: 'Delivery every 60 days' }
];

export const SELLING_PLAN_GROUP_ID = 'movo-subscribe-save';

export function sellingPlanGroup() {
  return {
    id: SELLING_PLAN_GROUP_ID,
    name: 'Subscribe & save',
    app_name: 'Shopify Subscriptions',
    options: [
      {
        name: 'Delivery every',
        position: 1,
        values: FREQUENCIES.map((frequency) => frequency.value)
      }
    ],
    selling_plans: FREQUENCIES.map((frequency, index) => ({
      id: frequency.id,
      name: frequency.name,
      description: `Ships automatically. Skip, pause or cancel anytime.`,
      recurring_deliveries: true,
      options: [{ name: 'Delivery every', value: frequency.value, position: 1 }],
      price_adjustments: [
        {
          order_count: null,
          position: index + 1,
          value_type: 'percentage',
          value: DISCOUNT_PERCENT
        }
      ],
      selected: index === 0
    }))
  };
}

/** Allocations are per variant: the discount applied to that variant's price. */
export function sellingPlanAllocations(variantPrice) {
  const group = sellingPlanGroup();

  return group.selling_plans.map((plan) => {
    const price = Math.round(variantPrice * (1 - DISCOUNT_PERCENT / 100));
    return {
      selling_plan: plan,
      selling_plan_group_id: group.id,
      price,
      compare_at_price: variantPrice,
      per_delivery_price: price,
      unit_price: null,
      checkout_charge_amount: price,
      remaining_balance_charge_amount: 0,
      price_adjustments: [{ position: 1, price }]
    };
  });
}

export const SUBSCRIPTION_DISCOUNT_PERCENT = DISCOUNT_PERCENT;
