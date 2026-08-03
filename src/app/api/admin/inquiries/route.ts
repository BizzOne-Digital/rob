import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import type { FilterQuery } from "mongoose";
import type { InquiryDocument } from "@/models/Inquiry";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  const filter: FilterQuery<InquiryDocument> = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
