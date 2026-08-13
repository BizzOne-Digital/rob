/**
 * Canada-wide shipping tiers (CAD).
 * Update `elevatedRate` when the client confirms pricing for orders above the threshold.
 */
export const CANADA_SHIPPING = {
  canadaOnly: true,
  /** Orders with this subtotal or less */
  standardMaxSubtotal: 11,
  standardRate: 10,
  /** Orders above standardMaxSubtotal — set when client confirms */
  elevatedRate: null as number | null,
  standardLabel: "Canada-wide Shipping",
  pickupLabel: "Local Pickup",
} as const;

export function calculateCanadaShippingAmount(
  subtotal: number,
  method: "pickup" | "shipping",
): number {
  if (method === "pickup") return 0;
  if (subtotal <= CANADA_SHIPPING.standardMaxSubtotal) {
    return CANADA_SHIPPING.standardRate;
  }
  return CANADA_SHIPPING.elevatedRate ?? CANADA_SHIPPING.standardRate;
}

export function getCanadaShippingDescription(subtotal: number): string {
  if (subtotal <= CANADA_SHIPPING.standardMaxSubtotal) {
    return `$${CANADA_SHIPPING.standardRate.toFixed(2)} delivery (Canada only)`;
  }
  if (CANADA_SHIPPING.elevatedRate != null) {
    return `$${CANADA_SHIPPING.elevatedRate.toFixed(2)} delivery (Canada only)`;
  }
  return `$${CANADA_SHIPPING.standardRate.toFixed(2)}+ delivery — final rate confirmed for orders over $${CANADA_SHIPPING.standardMaxSubtotal.toFixed(2)}`;
}

export function getCanadaShippingNote(subtotal: number): string | null {
  if (
    subtotal > CANADA_SHIPPING.standardMaxSubtotal &&
    CANADA_SHIPPING.elevatedRate == null
  ) {
    return "Delivery within Canada only. Orders over $11 may have a higher shipping rate — we'll confirm before dispatch.";
  }
  if (subtotal <= CANADA_SHIPPING.standardMaxSubtotal) {
    return "Delivery within Canada only.";
  }
  return null;
}

export const SHIPPING_POLICY_SUMMARY = `We deliver within Canada only — we do not ship internationally.

Standard delivery is $10 for orders up to $11 (before tax). For orders above $11, shipping rates are higher; updated pricing will be shared once confirmed.

Local pickup may still be available in select areas — details are confirmed after your order is placed.`;
