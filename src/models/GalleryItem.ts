import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema } from "./shared";

const GalleryItemSchema = new Schema(
  {
    title: { type: String, required: true },
    caption: String,
    image: { type: MediaRefSchema, required: true },
    category: String,
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    productSlug: String,
    behindTheScenes: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

GalleryItemSchema.index({ published: 1, displayOrder: 1 });

export type GalleryItemDocument = InferSchemaType<typeof GalleryItemSchema> & {
  _id: Schema.Types.ObjectId;
};

export const GalleryItem = getModel<GalleryItemDocument>(
  "GalleryItem",
  GalleryItemSchema,
);
