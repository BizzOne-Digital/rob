import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";
import type { MediaRef, SeoFields } from "@/types";

export const MediaRefSchema = new Schema<MediaRef>(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: { type: String, default: "" },
    caption: String,
    width: Number,
    height: Number,
  },
  { _id: false },
);

export const SeoSchema = new Schema<SeoFields>(
  {
    title: String,
    description: String,
    ogImage: String,
    canonical: String,
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

export function getModel<T>(name: string, schema: Schema): Model<T> {
  return (models[name] as Model<T>) || model<T>(name, schema);
}

export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type WithId<T> = T & { _id: string };
