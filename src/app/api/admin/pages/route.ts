import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/utils";
import { revalidatePage } from "@/lib/revalidate";
import { Page } from "@/models/Page";

const sectionSchema = z.object({
  key: z.string().min(1),
  type: z.enum([
    "hero",
    "text",
    "image",
    "image_grid",
    "cta",
    "faq",
    "process",
    "categories",
    "products",
    "gallery",
    "testimonials",
    "newsletter",
    "custom_form",
    "gift_inspiration",
    "marquee",
    "split",
    "rich",
  ]),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
  background: z.string().optional(),
  layout: z.string().optional(),
  visible: z.boolean().optional(),
  displayOrder: z.number().optional(),
  data: z.unknown().optional(),
});

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  path: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sections: z.array(sectionSchema).optional(),
  seo: z.record(z.string(), z.unknown()).optional(),
  showInNav: z.boolean().optional(),
  navLabel: z.string().optional(),
  navOrder: z.number().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const items = await Page.find().sort({ navOrder: 1, title: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = pageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid page data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.title);
  const path = data.path?.trim() || `/${slug}`;

  const existing = await Page.findOne({ $or: [{ slug }, { path }] });
  if (existing) {
    return NextResponse.json(
      { error: "A page with this slug or path already exists" },
      { status: 409 },
    );
  }

  const item = await Page.create({ ...data, slug, path });
  revalidatePage(item.path);

  await logActivity({
    session,
    action: "page.create",
    entityType: "Page",
    entityId: String(item._id),
    summary: `Created page "${item.title}"`,
  });

  return NextResponse.json({ item }, { status: 201 });
}
