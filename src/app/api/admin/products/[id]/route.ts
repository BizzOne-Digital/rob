import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import {
  deletePricingForProduct,
  syncPricingForProduct,
} from "@/lib/pricing-sync";
import { slugify } from "@/lib/utils";
import { revalidateProduct, revalidateShop } from "@/lib/revalidate";
import { Product } from "@/models/Product";
import { CreationCategory } from "@/models/CreationCategory";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  categorySlug: z.string().nullable().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  price: z.number().nullable().optional(),
  compareAtPrice: z.number().nullable().optional(),
  cost: z.number().nullable().optional(),
  priceVisibility: z.enum(["show", "contact"]).optional(),
  saleStartsAt: z.string().datetime().nullable().optional(),
  saleEndsAt: z.string().datetime().nullable().optional(),
  sku: z.string().optional(),
  inventory: z.number().optional(),
  trackInventory: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
  videoUrl: z.string().optional().nullable(),
  optionDefinitions: z.array(z.record(z.string(), z.unknown())).optional(),
  variants: z.array(z.record(z.string(), z.unknown())).optional(),
  scent: z.string().optional(),
  colour: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  waxType: z.string().optional(),
  wickType: z.string().optional(),
  vessel: z.string().optional(),
  burnTime: z.string().optional(),
  dimensions: z.string().optional(),
  personalizable: z.boolean().optional(),
  personalizationFields: z.array(z.record(z.string(), z.unknown())).optional(),
  productionTime: z.string().optional(),
  careInstructions: z.string().optional(),
  safetyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  badge: z.string().optional().nullable(),
  giftOccasions: z.array(z.string()).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  seo: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Product.findById(id).lean();
  if (!item) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const previousSlug = product.slug;
  const data = parsed.data;

  if (data.name !== undefined) product.name = data.name;
  if (data.slug !== undefined) {
    product.slug = data.slug.trim() || slugify(product.name);
  }
  if (data.categoryId !== undefined) {
    product.categoryId = data.categoryId
      ? new mongoose.Types.ObjectId(data.categoryId)
      : undefined;
    if (data.categoryId) {
      const category = await CreationCategory.findById(data.categoryId);
      if (category) product.categorySlug = category.slug;
    } else if (data.categorySlug === null) {
      product.categorySlug = undefined;
    }
  }
  if (data.categorySlug !== undefined && data.categoryId === undefined) {
    product.categorySlug = data.categorySlug ?? undefined;
  }

  const assignable: Array<keyof typeof data> = [
    "shortDescription",
    "fullDescription",
    "price",
    "compareAtPrice",
    "cost",
    "priceVisibility",
    "sku",
    "inventory",
    "trackInventory",
    "status",
    "videoUrl",
    "scent",
    "colour",
    "size",
    "material",
    "waxType",
    "wickType",
    "vessel",
    "burnTime",
    "dimensions",
    "personalizable",
    "productionTime",
    "careInstructions",
    "safetyInformation",
    "shippingInformation",
    "featured",
    "newArrival",
    "badge",
    "giftOccasions",
  ];

  for (const key of assignable) {
    if (data[key] !== undefined) {
      (product as unknown as Record<string, unknown>)[key] = data[key];
    }
  }

  if (data.saleStartsAt !== undefined) {
    product.saleStartsAt = data.saleStartsAt
      ? new Date(data.saleStartsAt)
      : undefined;
  }
  if (data.saleEndsAt !== undefined) {
    product.saleEndsAt = data.saleEndsAt
      ? new Date(data.saleEndsAt)
      : undefined;
  }
  if (data.images !== undefined) {
    product.images = data.images as typeof product.images;
  }
  if (data.optionDefinitions !== undefined) {
    product.optionDefinitions =
      data.optionDefinitions as typeof product.optionDefinitions;
  }
  if (data.variants !== undefined) {
    product.variants = data.variants as typeof product.variants;
  }
  if (data.personalizationFields !== undefined) {
    product.personalizationFields =
      data.personalizationFields as typeof product.personalizationFields;
  }
  if (data.relatedProductIds !== undefined) {
    product.relatedProductIds = data.relatedProductIds.map(
      (rid) => new mongoose.Types.ObjectId(rid),
    );
  }
  if (data.seo !== undefined) {
    product.seo = data.seo as typeof product.seo;
  }

  await product.save();
  await syncPricingForProduct(product);

  revalidateShop();
  revalidateProduct(product.slug);
  if (previousSlug !== product.slug) {
    revalidateProduct(previousSlug);
  }

  await logActivity({
    session,
    action: "product.update",
    entityType: "Product",
    entityId: String(product._id),
    summary: `Updated product "${product.name}"`,
  });

  return NextResponse.json({ item: product });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await deletePricingForProduct(product._id);
  revalidateShop();
  revalidateProduct(product.slug);

  await logActivity({
    session,
    action: "product.delete",
    entityType: "Product",
    entityId: String(product._id),
    summary: `Deleted product "${product.name}"`,
  });

  return NextResponse.json({ ok: true });
}
