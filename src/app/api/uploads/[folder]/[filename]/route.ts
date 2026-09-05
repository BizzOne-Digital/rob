import { NextRequest, NextResponse } from "next/server";
import { getStoredUpload, inferMimeTypeFromFilename } from "@/lib/stored-uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ folder: string; filename: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { folder, filename } = await context.params;
  const doc = await getStoredUpload(folder, filename);

  if (!doc?.data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType =
    doc.mimeType || inferMimeTypeFromFilename(filename) || "application/octet-stream";

  return new NextResponse(new Uint8Array(doc.data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(doc.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
