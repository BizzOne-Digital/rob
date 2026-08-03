import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const ActivityLogSchema = new Schema(
  {
    actorEmail: String,
    actorId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    action: { type: String, required: true, index: true },
    entityType: String,
    entityId: String,
    summary: { type: String, required: true },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true },
);

ActivityLogSchema.index({ createdAt: -1 });

export type ActivityLogDocument = InferSchemaType<typeof ActivityLogSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ActivityLog = getModel<ActivityLogDocument>(
  "ActivityLog",
  ActivityLogSchema,
);
