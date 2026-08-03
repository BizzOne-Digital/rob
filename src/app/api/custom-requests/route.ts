import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { notifyAdminCustomRequest } from "@/lib/email";
import { CustomRequest } from "@/models/CustomRequest";

const mediaSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const requestSchema = z.object({
  creationType: z.string().min(1),
  occasion: z.string().optional(),
  description: z.string().min(1).max(5000),
  preferredWording: z.string().optional(),
  colours: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  budgetRange: z.string().optional(),
  neededBy: z.string().datetime().optional().nullable(),
  referenceImages: z.array(mediaSchema).optional(),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  additionalNotes: z.string().optional(),
  consent: z.literal(true),
  website: z.string().optional(), // honeypot
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limited = rateLimit(`custom-request:${ip}`, 5, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json: unknown = await request.json();
  const parsed = requestSchema.safeParse(json);
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
  const item = await CustomRequest.create({
    creationType: parsed.data.creationType,
    occasion: parsed.data.occasion,
    description: parsed.data.description,
    preferredWording: parsed.data.preferredWording,
    colours: parsed.data.colours,
    quantity: parsed.data.quantity,
    budgetRange: parsed.data.budgetRange,
    neededBy: parsed.data.neededBy
      ? new Date(parsed.data.neededBy)
      : undefined,
    referenceImages: parsed.data.referenceImages,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    additionalNotes: parsed.data.additionalNotes,
    consent: parsed.data.consent,
    status: "new",
  });

  await notifyAdminCustomRequest({
    name: item.name,
    email: item.email,
    creationType: item.creationType,
  });

  return NextResponse.json({ ok: true, id: String(item._id) }, { status: 201 });
}
