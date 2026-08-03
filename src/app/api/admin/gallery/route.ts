import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { revalidateGallery } from "@/lib/revalidate";
import { GalleryItem } from "@/models/GalleryItem";

const mediaSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const createSchema = z.object({
  title: z.string().min(1),
  caption: z.string().optional(),
  image: mediaSchema,
  category: z.string().optional(),
  productId: z.string().optional().nullable(),
  productSlug: z.string().optional(),
  behindTheScenes: z.boolean().optional(),
  displayOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const published = request.nextUrl.searchParams.get("published");
  const filter =
    published === "true"
      ? { published: true }
      : published === "false"
        ? { published: false }
        : {};

  const items = await GalleryItem.find(filter)
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid gallery item", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await GalleryItem.create(parsed.data);
  revalidateGallery();

  await logActivity({
    session,
    action: "gallery.create",
    entityType: "GalleryItem",
    entityId: String(item._id),
    summary: `Added gallery item "${item.title}"`,
  });

  return NextResponse.json({ item }, { status: 201 });
}
