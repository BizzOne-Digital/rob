import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { revalidateShop } from "@/lib/revalidate";
import { PricingItem } from "@/models/PricingItem";
import { Product } from "@/models/Product";

const updateItemSchema = z.object({
  id: z.string().min(1),
  regularPrice: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  cost: z.number().nullable().optional(),
  priceVisibility: z.enum(["show", "contact"]).optional(),
  saleStartsAt: z.string().datetime().nullable().optional(),
  saleEndsAt: z.string().datetime().nullable().optional(),
});

const bulkSchema = z.object({
  items: z.array(updateItemSchema).min(1),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const items = await PricingItem.find()
    .sort({ productName: 1, variantName: 1 })
    .lean();
  return NextResponse.json({ items });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = bulkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid pricing data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const updatedIds: string[] = [];

  for (const row of parsed.data.items) {
    if (!mongoose.Types.ObjectId.isValid(row.id)) continue;

    const pricing = await PricingItem.findById(row.id);
    if (!pricing) continue;

    if (row.regularPrice !== undefined) pricing.regularPrice = row.regularPrice;
    if (row.salePrice !== undefined) pricing.salePrice = row.salePrice;
    if (row.cost !== undefined) pricing.cost = row.cost;
    if (row.priceVisibility !== undefined) {
      pricing.priceVisibility = row.priceVisibility;
    }
    if (row.saleStartsAt !== undefined) {
      pricing.saleStartsAt = row.saleStartsAt
        ? new Date(row.saleStartsAt)
        : undefined;
    }
    if (row.saleEndsAt !== undefined) {
      pricing.saleEndsAt = row.saleEndsAt
        ? new Date(row.saleEndsAt)
        : undefined;
    }

    // Contact-for-price: clear sellable price when visibility is contact
    if (pricing.priceVisibility === "contact") {
      // Keep stored amounts for admin reference; product sell price stays null-ish via visibility
    }

    await pricing.save();

    const product = await Product.findById(pricing.productId);
    if (!product) continue;

    const effectivePrice =
      pricing.priceVisibility === "contact"
        ? null
        : pricing.salePrice != null
          ? pricing.salePrice
          : pricing.regularPrice;

    const compareAt =
      pricing.priceVisibility === "contact"
        ? null
        : pricing.salePrice != null
          ? pricing.regularPrice
          : null;

    if (pricing.variantId) {
      const variant = product.variants.find(
        (v) => String(v._id) === pricing.variantId,
      );
      if (variant) {
        variant.price = effectivePrice;
        variant.compareAtPrice = compareAt;
        if (row.cost !== undefined) variant.cost = pricing.cost;
      }
      product.priceVisibility = pricing.priceVisibility;
    } else {
      product.price = effectivePrice;
      product.compareAtPrice = compareAt;
      product.cost = pricing.cost ?? product.cost;
      product.priceVisibility = pricing.priceVisibility;
      product.saleStartsAt = pricing.saleStartsAt ?? undefined;
      product.saleEndsAt = pricing.saleEndsAt ?? undefined;
    }

    await product.save();
    updatedIds.push(String(pricing._id));
  }

  revalidateShop();

  await logActivity({
    session,
    action: "pricing.bulk_update",
    entityType: "PricingItem",
    summary: `Updated ${updatedIds.length} pricing row(s)`,
    meta: { updatedIds },
  });

  const items = await PricingItem.find({
    _id: { $in: updatedIds },
  }).lean();

  return NextResponse.json({ items, updated: updatedIds.length });
}
