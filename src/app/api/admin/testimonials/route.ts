import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { revalidateTestimonials } from "@/lib/revalidate";
import { Testimonial } from "@/models/Testimonial";

const createSchema = z.object({
  customerName: z.string().min(1),
  reviewText: z.string().min(1),
  productId: z.string().optional().nullable(),
  productName: z.string().optional(),
  image: z.record(z.string(), z.unknown()).optional().nullable(),
  rating: z.number().min(1).max(5).optional(),
  featured: z.boolean().optional(),
  approved: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const approved = request.nextUrl.searchParams.get("approved");
  const filter =
    approved === "true"
      ? { approved: true }
      : approved === "false"
        ? { approved: false }
        : {};

  const items = await Testimonial.find(filter)
    .sort({ displayOrder: 1, createdAt: -1 })
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
      { error: "Invalid testimonial", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const item = await Testimonial.create(parsed.data);
  revalidateTestimonials();

  await logActivity({
    session,
    action: "testimonial.create",
    entityType: "Testimonial",
    entityId: String(item._id),
    summary: `Created testimonial from "${item.customerName}"`,
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
      { error: "Invalid testimonial", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, ...updates } = parsed.data;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Testimonial.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true },
  );
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateTestimonials();
  await logActivity({
    session,
    action: "testimonial.update",
    entityType: "Testimonial",
    entityId: String(item._id),
    summary: `Updated testimonial from "${item.customerName}"`,
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
  const item = await Testimonial.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateTestimonials();
  await logActivity({
    session,
    action: "testimonial.delete",
    entityType: "Testimonial",
    entityId: String(item._id),
    summary: `Deleted testimonial from "${item.customerName}"`,
  });

  return NextResponse.json({ ok: true });
}
