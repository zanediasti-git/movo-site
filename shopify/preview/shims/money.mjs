/**
 * Shopify stores money as an integer in the currency's subunit (cents).
 * These mirror the money filters closely enough for layout review.
 */
export function formatMoney(cents, { currency = false, trailingZeros = true } = {}) {
  const value = Number(cents);
  if (!Number.isFinite(value)) return '';

  let text = (value / 100).toFixed(2);
  if (!trailingZeros && text.endsWith('.00')) text = text.slice(0, -3);

  const [whole, fraction] = text.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const amount = fraction ? `${grouped}.${fraction}` : grouped;

  return currency ? `$${amount} USD` : `$${amount}`;
}
