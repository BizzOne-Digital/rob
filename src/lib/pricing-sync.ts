import { PricingItem } from "@/models/PricingItem";
import type { ProductDocument } from "@/models/Product";
import type { Types } from "mongoose";

type ProductLike = {
  _id: Types.ObjectId;
  name: string;
  sku?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  cost?: number | null;
  priceVisibility?: "show" | "contact" | null;
  saleStartsAt?: Date | null;
  saleEndsAt?: Date | null;
  variants?: Array<{
    _id?: Types.ObjectId;
    name?: string | null;
    sku?: string | null;
    price?: number | null;
    compareAtPrice?: number | null;
    cost?: number | null;
  }> | null;
};

export async function syncPricingForProduct(product: ProductLike | ProductDocument) {
  const productId = product._id;
  const priceVisibility = product.priceVisibility ?? "contact";

  await PricingItem.findOneAndUpdate(
    { productId, variantId: null },
    {
      productId,
      variantId: null,
      productName: product.name,
      variantName: null,
      sku: product.sku ?? null,
      regularPrice: product.compareAtPrice ?? product.price ?? null,
      salePrice:
        product.compareAtPrice != null && product.price != null
          ? product.price
          : null,
      cost: product.cost ?? null,
      priceVisibility,
      saleStartsAt: product.saleStartsAt ?? null,
      saleEndsAt: product.saleEndsAt ?? null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const variants = product.variants ?? [];
  for (const variant of variants) {
    const variantId = variant._id ? String(variant._id) : undefined;
    if (!variantId) continue;

    await PricingItem.findOneAndUpdate(
      { productId, variantId },
      {
        productId,
        variantId,
        productName: product.name,
        variantName: variant.name ?? null,
        sku: variant.sku ?? product.sku ?? null,
        regularPrice: variant.compareAtPrice ?? variant.price ?? null,
        salePrice:
          variant.compareAtPrice != null && variant.price != null
            ? variant.price
            : null,
        cost: variant.cost ?? null,
        priceVisibility,
        saleStartsAt: product.saleStartsAt ?? null,
        saleEndsAt: product.saleEndsAt ?? null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

export async function deletePricingForProduct(productId: Types.ObjectId | string) {
  await PricingItem.deleteMany({ productId });
}
