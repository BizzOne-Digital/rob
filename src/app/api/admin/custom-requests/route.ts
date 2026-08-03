import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { CustomRequest } from "@/models/CustomRequest";
import type { FilterQuery } from "mongoose";
import type { CustomRequestDocument } from "@/models/CustomRequest";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  const filter: FilterQuery<CustomRequestDocument> = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { creationType: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    CustomRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CustomRequest.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
