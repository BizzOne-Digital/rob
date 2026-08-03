import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { FAQ } from "@/models/FAQ";

const createSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  displayOrder: z.number().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const category = request.nextUrl.searchParams.get("category");
  const filter = category ? { category } : {};
  const items = await FAQ.find(filter)
    .sort({ category: 1, displayOrder: 1 })
    .lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid FAQ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await FAQ.create(parsed.data);

  await logActivity({
    session,
    action: "faq.create",
    entityType: "FAQ",
    entityId: String(item._id),
    summary: `Created FAQ: ${item.question}`,
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid FAQ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, ...updates } = parsed.data;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await FAQ.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "faq.update",
    entityType: "FAQ",
    entityId: String(item._id),
    summary: `Updated FAQ: ${item.question}`,
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
  const item = await FAQ.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity({
    session,
    action: "faq.delete",
    entityType: "FAQ",
    entityId: String(item._id),
    summary: `Deleted FAQ: ${item.question}`,
  });

  return NextResponse.json({ ok: true });
}
