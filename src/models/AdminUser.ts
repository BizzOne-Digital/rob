import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "admin" },
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type AdminUserDocument = InferSchemaType<typeof AdminUserSchema> & {
  _id: Schema.Types.ObjectId;
};

export const AdminUser = getModel<AdminUserDocument>("AdminUser", AdminUserSchema);
