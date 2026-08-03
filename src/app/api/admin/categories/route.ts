import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/utils";
import { revalidateCategories } from "@/lib/revalidate";
import { CreationCategory } from "@/models/CreationCategory";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().min(1),
  fullDescription: z.string().optional(),
  heroEyebrow: z.string().optional(),
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  heroImage: z.record(z.string(), z.unknown()).optional().nullable(),
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

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const items = await CreationCategory.find()
    .sort({ displayOrder: 1, name: 1 })
    .lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = categorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);

  const existing = await CreationCategory.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const item = await CreationCategory.create({ ...data, slug });
  revalidateCategories();

  await logActivity({
    session,
    action: "category.create",
    entityType: "CreationCategory",
    entityId: String(item._id),
    summary: `Created category "${item.name}"`,
  });

  return NextResponse.json({ item }, { status: 201 });
}
