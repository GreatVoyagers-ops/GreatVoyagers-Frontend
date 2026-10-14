export const toNumber = (value) => Number(String(value ?? "").replace(/[^\d.]/g, "")) || 0;

// Mirrors backend/src/lib/quotePricing.js so the editor can show totals before saving.
export function computeTotals({ adults = 0, children = 0, pricing = {} }) {
  const subtotal = Math.round(toNumber(adults) * toNumber(pricing.perAdult) + toNumber(children) * toNumber(pricing.perChild));
  const gst = Math.round((subtotal * toNumber(pricing.gstPercent)) / 100);
  const tcs = Math.round(((subtotal + gst) * toNumber(pricing.tcsPercent)) / 100);
  return { subtotal, gst, tcs, total: subtotal + gst + tcs };
}
