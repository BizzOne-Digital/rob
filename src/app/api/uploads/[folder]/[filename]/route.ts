import { NextRequest, NextResponse } from "next/server";
import { getStoredUpload } from "@/lib/stored-uploads";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ folder: string; filename: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { folder, filename } = await context.params;
  const doc = await getStoredUpload(folder, filename);

  if (!doc?.data) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(doc.data, {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
