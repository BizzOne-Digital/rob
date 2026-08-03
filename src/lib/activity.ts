import { ActivityLog } from "@/models/ActivityLog";
import type { Session } from "next-auth";
import mongoose from "mongoose";

export async function logActivity(options: {
  session?: Session | null;
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await ActivityLog.create({
      actorEmail: options.session?.user?.email ?? undefined,
      actorId: options.session?.user?.id
        ? new mongoose.Types.ObjectId(options.session.user.id)
        : undefined,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      summary: options.summary,
      meta: options.meta,
    });
  } catch (error) {
    console.error("[activity]", error);
  }
}
