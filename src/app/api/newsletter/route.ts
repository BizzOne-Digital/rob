import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  consent: z.literal(true),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limited = rateLimit(`newsletter:${ip}`, 10, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json: unknown = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Consent and a valid email are required",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  await NewsletterSubscriber.findOneAndUpdate(
    { email },
    {
      email,
      name: parsed.data.name,
      consentedAt: new Date(),
      active: true,
      source: "website",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return NextResponse.json({ ok: true });
}
