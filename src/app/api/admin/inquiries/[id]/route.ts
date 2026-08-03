import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { Inquiry } from "@/models/Inquiry";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]).optional(),
  adminNotes: z.string().optional().nullable(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Inquiry.findById(id).lean();
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await Inquiry.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  );
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "inquiry.update",
    entityType: "Inquiry",
    entityId: String(item._id),
    summary: `Updated inquiry from ${item.name}`,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Inquiry.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "inquiry.delete",
    entityType: "Inquiry",
    entityId: String(item._id),
    summary: `Deleted inquiry from ${item.name}`,
  });

  return NextResponse.json({ ok: true });
}
