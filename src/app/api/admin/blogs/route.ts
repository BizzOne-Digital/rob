import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";
import { revalidateBlog } from "@/lib/revalidate";
import { BlogPost } from "@/models/Blog";

const createSchema = z.object({
  title: z.string().min(1),
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

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const status = request.nextUrl.searchParams.get("status");
  const filter = status ? { status } : {};
  const items = await BlogPost.find(filter).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid blog post", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.title);
  const existing = await BlogPost.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { error: "A post with this slug already exists" },
      { status: 409 },
    );
  }

  const content = data.content ? sanitizeRichHtml(data.content) : "";
  const status = data.status ?? "draft";
  const item = await BlogPost.create({
    ...data,
    slug,
    content,
    publishedAt:
      data.publishedAt
        ? new Date(data.publishedAt)
        : status === "published"
          ? new Date()
          : undefined,
  });

  revalidateBlog(item.slug);
  await logActivity({
    session,
    action: "blog.create",
    entityType: "BlogPost",
    entityId: String(item._id),
    summary: `Created blog post "${item.title}"`,
  });

  return NextResponse.json({ item }, { status: 201 });
}
