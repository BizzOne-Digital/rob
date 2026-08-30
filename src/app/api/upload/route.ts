import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  deleteStoredUploadByUrl,
  isAllowedMimeType,
  MAX_UPLOAD_BYTES,
  saveStoredUpload,
} from "@/lib/stored-uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File must be 8MB or smaller" }, { status: 400 });
  }

  const mimeType = file.type;
  if (!isAllowedMimeType(mimeType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
      { status: 400 },
    );
  }

  const folder = String(form.get("folder") ?? "misc");
  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveStoredUpload(buffer, mimeType, folder);

  return NextResponse.json({
    success: true,
    url: saved.url,
    filename: saved.filename,
    size: saved.size,
    folder: saved.folder,
  });
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let url: string | undefined;
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "url" in body) {
      url = typeof (body as { url?: unknown }).url === "string"
        ? (body as { url: string }).url
        : undefined;
    }
  } catch {
    url = request.nextUrl.searchParams.get("url") ?? undefined;
  }

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  await deleteStoredUploadByUrl(url);
  return NextResponse.json({ success: true });
}
