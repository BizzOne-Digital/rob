import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

const WISHLIST_COOKIE = "rw_wishlist";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

const mutateSchema = z.object({
  productId: z.string().min(1),
});

function readWishlist(request: NextRequest): string[] {
  const raw = request.cookies.get(WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeWishlist(response: NextResponse, ids: string[]) {
  response.cookies.set(WISHLIST_COOKIE, encodeURIComponent(JSON.stringify(ids)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const ids = readWishlist(request);
  await connectDB();

  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const products = objectIds.length
    ? await Product.find({
        _id: { $in: objectIds },
        status: "published",
      }).lean()
    : [];

  const byId = new Map(products.map((p) => [String(p._id), p]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

  return NextResponse.json({ productIds: ids, items: ordered });
}

export async function POST(request: NextRequest) {
  const json: unknown = await request.json();
  const parsed = mutateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(parsed.data.productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findOne({
    _id: parsed.data.productId,
    status: "published",
  }).lean();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const ids = readWishlist(request);
  if (!ids.includes(parsed.data.productId)) {
    ids.push(parsed.data.productId);
  }

  const response = NextResponse.json({ productIds: ids });
  return writeWishlist(response, ids);
}

export async function DELETE(request: NextRequest) {
  const productId =
    request.nextUrl.searchParams.get("productId") ||
    ((await request.json().catch(() => null)) as { productId?: string } | null)
      ?.productId;

  if (!productId) {
    const response = NextResponse.json({ productIds: [] as string[] });
    return writeWishlist(response, []);
  }

  const ids = readWishlist(request).filter((id) => id !== productId);
  const response = NextResponse.json({ productIds: ids });
  return writeWishlist(response, ids);
}
