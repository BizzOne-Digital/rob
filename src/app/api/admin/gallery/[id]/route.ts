import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { revalidateGallery } from "@/lib/revalidate";
import { GalleryItem } from "@/models/GalleryItem";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  caption: z.string().optional().nullable(),
  image: z
    .object({
      url: z.string().min(1),
      publicId: z.string().optional(),
      alt: z.string().default(""),
      caption: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  category: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  productSlug: z.string().optional().nullable(),
  behindTheScenes: z.boolean().optional(),
  displayOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await GalleryItem.findById(id).lean();
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
      { error: "Invalid gallery item", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await GalleryItem.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  );
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateGallery();
  await logActivity({
    session,
    action: "gallery.update",
    entityType: "GalleryItem",
    entityId: String(item._id),
    summary: `Updated gallery item "${item.title}"`,
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
  const item = await GalleryItem.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateGallery();
  await logActivity({
    session,
    action: "gallery.delete",
    entityType: "GalleryItem",
    entityId: String(item._id),
    summary: `Deleted gallery item "${item.title}"`,
  });

  return NextResponse.json({ ok: true });
}
