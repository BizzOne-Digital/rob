import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { revalidatePage } from "@/lib/revalidate";
import { Page } from "@/models/Page";

type RouteContext = { params: Promise<{ slug: string }> };

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

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  path: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sections: z.array(sectionSchema).optional(),
  seo: z.record(z.string(), z.unknown()).optional(),
  showInNav: z.boolean().optional(),
  navLabel: z.string().optional(),
  navOrder: z.number().optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { slug } = await context.params;
  await connectDB();
  const item = await Page.findOne({ slug }).lean();
  if (!item) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { slug } = await context.params;
  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid page data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await Page.findOne({ slug });
  if (!item) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const previousPath = item.path;
  const data = parsed.data;
  if (data.title !== undefined) item.title = data.title;
  if (data.slug !== undefined) item.slug = data.slug;
  if (data.path !== undefined) item.path = data.path;
  if (data.status !== undefined) item.status = data.status;
  if (data.sections !== undefined) {
    item.sections = data.sections as typeof item.sections;
  }
  if (data.seo !== undefined) item.seo = data.seo as typeof item.seo;
  if (data.showInNav !== undefined) item.showInNav = data.showInNav;
  if (data.navLabel !== undefined) item.navLabel = data.navLabel;
  if (data.navOrder !== undefined) item.navOrder = data.navOrder;

  await item.save();
  revalidatePage(item.path);
  if (previousPath !== item.path) revalidatePage(previousPath);

  await logActivity({
    session,
    action: "page.update",
    entityType: "Page",
    entityId: String(item._id),
    summary: `Updated page "${item.title}"`,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { slug } = await context.params;
  await connectDB();
  const item = await Page.findOneAndDelete({ slug });
  if (!item) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  revalidatePage(item.path);
  await logActivity({
    session,
    action: "page.delete",
    entityType: "Page",
    entityId: String(item._id),
    summary: `Deleted page "${item.title}"`,
  });

  return NextResponse.json({ ok: true });
}
