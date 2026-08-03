import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, index: true },
    filename: String,
    format: String,
    resourceType: { type: String, default: "image" },
    bytes: Number,
    width: Number,
    height: Number,
    alt: { type: String, default: "" },
    caption: String,
    category: { type: String, default: "general", index: true },
    folder: String,
    tags: [String],
  },
  { timestamps: true },
);

MediaAssetSchema.index({ filename: "text", alt: "text", caption: "text" });

export type MediaAssetDocument = InferSchemaType<typeof MediaAssetSchema> & {
  _id: Schema.Types.ObjectId;
};

export const MediaAsset = getModel<MediaAssetDocument>(
  "MediaAsset",
  MediaAssetSchema,
);
