import { formatCurrency, isValidPrice } from "@/lib/utils";

export function getDisplayPrice(
  product: {
    price?: number | null;
    priceVisibility?: string | null;
    compareAtPrice?: number | null;
  },
  currency = "CAD",
): { label: string; hasPrice: boolean; compareAt?: string } {
  if (
    product.priceVisibility === "contact" ||
    !isValidPrice(product.price)
  ) {
    return { label: "Contact for Price", hasPrice: false };
  }

  return {
    label: formatCurrency(product.price, currency),
    hasPrice: true,
    compareAt: isValidPrice(product.compareAtPrice)
      ? formatCurrency(product.compareAtPrice, currency)
      : undefined,
  };
}
