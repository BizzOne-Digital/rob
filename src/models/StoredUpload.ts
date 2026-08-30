import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const StoredUploadSchema = new Schema(
  {
    folder: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });

export type StoredUploadDocument = InferSchemaType<typeof StoredUploadSchema> & {
  _id: Schema.Types.ObjectId;
};

export const StoredUpload = getModel<StoredUploadDocument>(
  "StoredUpload",
  StoredUploadSchema,
);
