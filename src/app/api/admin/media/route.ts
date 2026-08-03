import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import {
  deleteFromCloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary";
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
  const category = String(form.get("category") ?? "general");
  const folder = String(form.get("folder") ?? "rw-designs-canada");

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file.name || "upload";
  const ext = path.extname(originalName) || "";
  const safeBase = originalName
    .replace(ext, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40);
  const filename = `${safeBase || "file"}-${randomUUID()}${ext}`;

  let url: string;
  let publicId: string | undefined;
  let width: number | undefined;
  let height: number | undefined;
  let bytes: number | undefined = buffer.length;
  let format: string | undefined = ext.replace(".", "") || undefined;

  if (isCloudinaryConfigured()) {
    const uploaded = await uploadToCloudinary(buffer, {
      folder,
      filename: `${safeBase || "file"}-${randomUUID()}`,
      resourceType: "auto",
    });
    url = uploaded.url;
    publicId = uploaded.publicId;
    width = uploaded.width;
    height = uploaded.height;
    bytes = uploaded.bytes;
    format = uploaded.format;
  } else {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const diskPath = path.join(uploadsDir, filename);
    await writeFile(diskPath, buffer);
    url = `/uploads/${filename}`;
  }

  await connectDB();
  const item = await MediaAsset.create({
    url,
    publicId,
    filename: originalName,
    format,
    resourceType: "image",
    bytes,
    width,
    height,
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

  if (item.publicId) {
    await deleteFromCloudinary(item.publicId);
  } else if (item.url.startsWith("/uploads/")) {
    const diskPath = path.join(process.cwd(), "public", item.url);
    try {
      await unlink(diskPath);
    } catch {
      // ignore missing local file
    }
  }

  await logActivity({
    session,
    action: "media.delete",
    entityType: "MediaAsset",
    entityId: String(item._id),
    summary: `Deleted media ${item.filename ?? item.url}`,
  });

  return NextResponse.json({ ok: true });
}
