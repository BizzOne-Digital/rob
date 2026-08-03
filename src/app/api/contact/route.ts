import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { notifyAdminInquiry } from "@/lib/email";
import { Inquiry } from "@/models/Inquiry";

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1).max(5000),
  type: z
    .enum(["general", "product", "custom_order", "existing_order", "wholesale"])
    .optional(),
  orderNumber: z.string().optional(),
  productSlug: z.string().optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limited = rateLimit(`contact:${ip}`, 8, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json: unknown = await request.json();
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  await connectDB();
  const inquiry = await Inquiry.create({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    type: parsed.data.type ?? "general",
    orderNumber: parsed.data.orderNumber,
    productSlug: parsed.data.productSlug,
    status: "new",
  });

  await notifyAdminInquiry({
    name: inquiry.name,
    email: inquiry.email,
    type: inquiry.type,
    message: inquiry.message,
  });

  return NextResponse.json({ ok: true, id: String(inquiry._id) }, { status: 201 });
}
