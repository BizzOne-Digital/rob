import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { syncPricingForProduct } from "@/lib/pricing-sync";
import { slugify } from "@/lib/utils";
import { revalidateProduct, revalidateShop } from "@/lib/revalidate";
import { Product } from "@/models/Product";
import { CreationCategory } from "@/models/CreationCategory";
import type { FilterQuery } from "mongoose";
import type { ProductDocument } from "@/models/Product";

const mediaRefSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const productBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  categorySlug: z.string().optional().nullable(),
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
  images: z.array(mediaRefSchema).optional(),
  videoUrl: z.string().optional(),
  optionDefinitions: z
    .array(z.object({ name: z.string(), values: z.array(z.string()) }))
    .optional(),
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
  badge: z.string().optional(),
  giftOccasions: z.array(z.string()).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      ogImage: z.string().optional(),
      canonical: z.string().optional(),
      noIndex: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const categorySlug = searchParams.get("categorySlug");
  const featured = searchParams.get("featured");
  const priceVisibility = searchParams.get("priceVisibility");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ProductDocument> = {};
  if (status) filter.status = status;
  if (categorySlug) filter.categorySlug = categorySlug;
  if (featured === "true") filter.featured = true;
  if (featured === "false") filter.featured = false;
  if (priceVisibility === "show" || priceVisibility === "contact") {
    filter.priceVisibility = priceVisibility;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { shortDescription: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = productBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);

  const existing = await Product.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
      { status: 409 },
    );
  }

  let categorySlug = data.categorySlug ?? undefined;
  if (data.categoryId) {
    const category = await CreationCategory.findById(data.categoryId);
    if (category) categorySlug = category.slug;
  }

  const product = await Product.create({
    ...data,
    slug,
    categorySlug,
    saleStartsAt: data.saleStartsAt ? new Date(data.saleStartsAt) : undefined,
    saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : undefined,
  });

  await syncPricingForProduct(product);
  revalidateShop();
  if (product.status === "published") {
    revalidateProduct(product.slug);
  }

  await logActivity({
    session,
    action: "product.create",
    entityType: "Product",
    entityId: String(product._id),
    summary: `Created product "${product.name}"`,
  });

  return NextResponse.json({ item: product }, { status: 201 });
}
