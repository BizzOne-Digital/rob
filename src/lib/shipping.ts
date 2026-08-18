/**
 * Canada-wide shipping (CAD).
 * $10 flat rate for orders up to 11 lbs; higher rates above that (TBD by client).
 */
export const CANADA_SHIPPING = {
  canadaOnly: true,
  flatRate: 10,
  maxWeightLbs: 11,
  standardLabel: "Canada-wide Shipping",
  pickupLabel: "Local Pickup",
} as const;

export function calculateCanadaShippingAmount(
  _subtotal: number,
  method: "pickup" | "shipping",
): number {
  if (method === "pickup") return 0;
  return CANADA_SHIPPING.flatRate;
}

export function getCanadaShippingDescription(_subtotal?: number): string {
  return `$${CANADA_SHIPPING.flatRate.toFixed(2)} flat rate for orders up to ${CANADA_SHIPPING.maxWeightLbs} lbs (Canada only)`;
}

export function getCanadaShippingNote(_subtotal?: number): string {
  return `Delivery within Canada only. $${CANADA_SHIPPING.flatRate.toFixed(2)} flat rate for orders up to ${CANADA_SHIPPING.maxWeightLbs} lbs. Higher rates may apply above ${CANADA_SHIPPING.maxWeightLbs} lbs.`;
}

export const SHIPPING_CART_SUMMARY = getCanadaShippingNote();

export const SHIPPING_POLICY_SUMMARY = `We deliver within Canada only — we do not ship internationally.

Standard delivery is a $10 flat rate for orders up to 11 lbs. For orders above 11 lbs, shipping rates are higher; updated pricing will be posted once confirmed.

Local pickup may be available in select areas — details are confirmed after your order is placed.`;

export const SHIPPING_FAQ_ANSWER =
  "Yes — we deliver within Canada only. Standard delivery is a $10 flat rate for orders up to 11 lbs. For orders above 11 lbs, shipping rates are higher; updated pricing will be shared once confirmed.";
