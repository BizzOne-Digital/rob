import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/utils";
import { revalidateCategories } from "@/lib/revalidate";
import { CreationCategory } from "@/models/CreationCategory";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  summary: z.string().min(1).optional(),
  fullDescription: z.string().optional(),
  heroEyebrow: z.string().optional(),
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  heroImage: z.record(z.string(), z.unknown()).nullable().optional(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
  creationProcess: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .optional(),
  careInformation: z.string().optional(),
  safetyInformation: z.string().optional(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  options: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
  customOrderCta: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  displayOrder: z.number().optional(),
  active: z.boolean().optional(),
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
  const item = await CreationCategory.findById(id).lean();
  if (!item) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
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
      { error: "Invalid category data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await CreationCategory.findById(id);
  if (!item) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const data = parsed.data;
  if (data.name !== undefined) item.name = data.name;
  if (data.slug !== undefined) {
    item.slug = data.slug.trim() || slugify(item.name);
  }
  if (data.summary !== undefined) item.summary = data.summary;
  if (data.fullDescription !== undefined) {
    item.fullDescription = data.fullDescription;
  }
  if (data.heroEyebrow !== undefined) item.heroEyebrow = data.heroEyebrow;
  if (data.heroHeading !== undefined) item.heroHeading = data.heroHeading;
  if (data.heroSubheading !== undefined) {
    item.heroSubheading = data.heroSubheading;
  }
  if (data.heroImage !== undefined) {
    item.heroImage = data.heroImage as typeof item.heroImage;
  }
  if (data.images !== undefined) {
    item.images = data.images as typeof item.images;
  }
  if (data.creationProcess !== undefined) {
    item.creationProcess = data.creationProcess as typeof item.creationProcess;
  }
  if (data.careInformation !== undefined) {
    item.careInformation = data.careInformation;
  }
  if (data.safetyInformation !== undefined) {
    item.safetyInformation = data.safetyInformation;
  }
  if (data.faqs !== undefined) item.faqs = data.faqs as typeof item.faqs;
  if (data.options !== undefined) item.options = data.options;
  if (data.ctaLabel !== undefined) item.ctaLabel = data.ctaLabel;
  if (data.ctaLink !== undefined) item.ctaLink = data.ctaLink;
  if (data.customOrderCta !== undefined) {
    item.customOrderCta = data.customOrderCta;
  }
  if (data.productIds !== undefined) {
    item.productIds = data.productIds.map(
      (pid) => new mongoose.Types.ObjectId(pid),
    );
  }
  if (data.displayOrder !== undefined) item.displayOrder = data.displayOrder;
  if (data.active !== undefined) item.active = data.active;
  if (data.seo !== undefined) item.seo = data.seo as typeof item.seo;

  await item.save();
  revalidateCategories();

  await logActivity({
    session,
    action: "category.update",
    entityType: "CreationCategory",
    entityId: String(item._id),
    summary: `Updated category "${item.name}"`,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await CreationCategory.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  revalidateCategories();
  await logActivity({
    session,
    action: "category.delete",
    entityType: "CreationCategory",
    entityId: String(item._id),
    summary: `Deleted category "${item.name}"`,
  });

  return NextResponse.json({ ok: true });
}
