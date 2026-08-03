import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { Discount } from "@/models/Discount";

const createSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
  minSubtotal: z.number().optional(),
  maxUses: z.number().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  active: z.boolean().optional(),
  description: z.string().optional(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().min(1),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const items = await Discount.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid discount", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const data = parsed.data;
  try {
    const item = await Discount.create({
      ...data,
      code: data.code.toUpperCase().trim(),
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      maxUses: data.maxUses ?? undefined,
    });

    await logActivity({
      session,
      action: "discount.create",
      entityType: "Discount",
      entityId: String(item._id),
      summary: `Created discount code ${item.code}`,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Discount code already exists" },
      { status: 409 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid discount", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, ...rest } = parsed.data;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const updates: Record<string, unknown> = { ...rest };
  if (rest.code) updates.code = rest.code.toUpperCase().trim();
  if (rest.startsAt !== undefined) {
    updates.startsAt = rest.startsAt ? new Date(rest.startsAt) : null;
  }
  if (rest.endsAt !== undefined) {
    updates.endsAt = rest.endsAt ? new Date(rest.endsAt) : null;
  }

  const item = await Discount.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true },
  );
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "discount.update",
    entityType: "Discount",
    entityId: String(item._id),
    summary: `Updated discount code ${item.code}`,
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Discount.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "discount.delete",
    entityType: "Discount",
    entityId: String(item._id),
    summary: `Deleted discount code ${item.code}`,
  });

  return NextResponse.json({ ok: true });
}
