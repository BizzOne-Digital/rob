import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { revalidateBlog } from "@/lib/revalidate";
import { BlogPost } from "@/models/Blog";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.record(z.string(), z.unknown()).optional().nullable(),
  contentImages: z.array(z.record(z.string(), z.unknown())).optional(),
  categoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
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
  const item = await BlogPost.findById(id).lean();
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
      { error: "Invalid blog post", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await BlogPost.findById(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const previousSlug = item.slug;
  const data = parsed.data;
  if (data.title !== undefined) item.title = data.title;
  if (data.slug !== undefined) item.slug = data.slug;
  if (data.excerpt !== undefined) item.excerpt = data.excerpt;
  if (data.content !== undefined) {
    item.content = sanitizeRichHtml(data.content);
  }
  if (data.featuredImage !== undefined) {
    item.featuredImage = data.featuredImage as typeof item.featuredImage;
  }
  if (data.contentImages !== undefined) {
    item.contentImages = data.contentImages as typeof item.contentImages;
  }
  if (data.categoryIds !== undefined) {
    item.categoryIds = data.categoryIds.map(
      (cid) => new mongoose.Types.ObjectId(cid),
    );
  }
  if (data.tags !== undefined) item.tags = data.tags;
  if (data.author !== undefined) item.author = data.author;
  if (data.status !== undefined) {
    item.status = data.status;
    if (data.status === "published" && !item.publishedAt) {
      item.publishedAt = new Date();
    }
  }
  if (data.publishedAt !== undefined) {
    item.publishedAt = data.publishedAt
      ? new Date(data.publishedAt)
      : undefined;
  }
  if (data.seo !== undefined) item.seo = data.seo as typeof item.seo;

  await item.save();
  revalidateBlog(item.slug);
  if (previousSlug !== item.slug) revalidateBlog(previousSlug);

  await logActivity({
    session,
    action: "blog.update",
    entityType: "BlogPost",
    entityId: String(item._id),
    summary: `Updated blog post "${item.title}"`,
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
  const item = await BlogPost.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateBlog(item.slug);
  await logActivity({
    session,
    action: "blog.delete",
    entityType: "BlogPost",
    entityId: String(item._id),
    summary: `Deleted blog post "${item.title}"`,
  });

  return NextResponse.json({ ok: true });
}
