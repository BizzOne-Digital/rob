import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { deleteUploadFile, saveUploadFile } from "@/lib/uploads";
import { MediaAsset } from "@/models/MediaAsset";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 40)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) {
    filter.$or = [
      { filename: { $regex: q, $options: "i" } },
      { alt: { $regex: q, $options: "i" } },
      { caption: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    MediaAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MediaAsset.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const alt = String(form.get("alt") ?? "");
  const caption = String(form.get("caption") ?? "");
  const category = String(form.get("category") ?? "general") || "general";
  const folder = String(form.get("folder") ?? category) || "general";

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file.name || "upload";
  const uploaded = await saveUploadFile(buffer, originalName, { folder });

  await connectDB();
  const item = await MediaAsset.create({
    url: uploaded.url,
    filename: originalName,
    format: uploaded.format,
    resourceType: file.type.startsWith("video/") ? "video" : "image",
    bytes: uploaded.bytes,
    alt,
    caption,
    category,
    folder,
  });

  await logActivity({
    session,
    action: "media.upload",
    entityType: "MediaAsset",
    entityId: String(item._id),
    summary: `Uploaded media ${originalName}`,
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await MediaAsset.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteUploadFile(item.url);

  await logActivity({
    session,
    action: "media.delete",
    entityType: "MediaAsset",
    entityId: String(item._id),
    summary: `Deleted media ${item.filename ?? item.url}`,
  });

  return NextResponse.json({ ok: true });
}
