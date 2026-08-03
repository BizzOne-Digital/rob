import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { CustomRequest } from "@/models/CustomRequest";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z
    .enum(["new", "reviewing", "quoted", "accepted", "declined", "completed"])
    .optional(),
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
  const item = await CustomRequest.findById(id).lean();
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
  const item = await CustomRequest.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  );
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "custom_request.update",
    entityType: "CustomRequest",
    entityId: String(item._id),
    summary: `Updated custom request from ${item.name}`,
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
  const item = await CustomRequest.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "custom_request.delete",
    entityType: "CustomRequest",
    entityId: String(item._id),
    summary: `Deleted custom request from ${item.name}`,
  });

  return NextResponse.json({ ok: true });
}
