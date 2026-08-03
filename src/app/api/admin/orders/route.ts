import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import type { FilterQuery } from "mongoose";
import type { OrderDocument } from "@/models/Order";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const paymentStatus = searchParams.get("paymentStatus");
  const fulfillmentStatus = searchParams.get("fulfillmentStatus");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  const filter: FilterQuery<OrderDocument> = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (fulfillmentStatus) filter.fulfillmentStatus = fulfillmentStatus;
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { "shippingAddress.fullName": { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
