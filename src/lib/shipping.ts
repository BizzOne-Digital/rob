/**
 * Canada-wide flat rate shipping (CAD).
 * Simple $10 flat rate for all orders.
 */
export const CANADA_SHIPPING = {
  canadaOnly: true,
  flatRate: 10,
  standardLabel: "Flat Rate Shipping",
  pickupLabel: "Local Pickup",
} as const;

export function calculateCanadaShippingAmount(
  subtotal: number,
  method: "pickup" | "shipping",
): number {
  if (method === "pickup") return 0;
  return CANADA_SHIPPING.flatRate;
}

export function getCanadaShippingDescription(subtotal: number): string {
  return `$${CANADA_SHIPPING.flatRate.toFixed(2)} flat rate delivery (Canada only)`;
}

export function getCanadaShippingNote(subtotal: number): string | null {
  return "Delivery within Canada only. Flat rate $10 shipping.";
}

export const SHIPPING_POLICY_SUMMARY = `We deliver within Canada only — we do not ship internationally.

Flat rate shipping is $10 for all orders.

Local pickup may be available in select areas — details are confirmed after your order is placed.`;
