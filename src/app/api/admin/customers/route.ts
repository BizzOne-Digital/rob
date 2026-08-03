import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { Customer } from "@/models/Customer";

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { email: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Customer.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid customer data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, ...updates } = parsed.data;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Customer.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true },
  );
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "customer.update",
    entityType: "Customer",
    entityId: String(item._id),
    summary: `Updated customer ${item.email}`,
  });

  return NextResponse.json({ item });
}
