import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    40,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 12)),
  );

  if (!q) {
    return NextResponse.json({ items: [], total: 0, q: "" });
  }

  await connectDB();

  const filter = {
    status: "published" as const,
    $or: [
      { name: { $regex: q, $options: "i" } },
      { shortDescription: { $regex: q, $options: "i" } },
      { categorySlug: { $regex: q, $options: "i" } },
      { scent: { $regex: q, $options: "i" } },
      { colour: { $regex: q, $options: "i" } },
      { giftOccasions: { $elemMatch: { $regex: q, $options: "i" } } },
    ],
  };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(
        "name slug shortDescription price priceVisibility images categorySlug featured badge",
      )
      .sort({ featured: -1, updatedAt: -1 })
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, q });
}
