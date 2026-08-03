import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { revalidateAfterSettingsChange } from "@/lib/revalidate";
import { SiteSettings } from "@/models/SiteSettings";

const patchSchema = z.record(z.string(), z.unknown());

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  let settings = await SiteSettings.findOne({ singletonKey: "site" });
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return NextResponse.json({ item: settings });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const data = { ...parsed.data };
  delete data.singletonKey;
  delete data._id;

  const settings = await SiteSettings.findOneAndUpdate(
    { singletonKey: "site" },
    { $set: data },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  revalidateAfterSettingsChange();

  await logActivity({
    session,
    action: "settings.update",
    entityType: "SiteSettings",
    entityId: String(settings._id),
    summary: "Updated site settings",
  });

  return NextResponse.json({ item: settings });
}
