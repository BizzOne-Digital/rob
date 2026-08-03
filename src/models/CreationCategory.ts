import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema, SeoSchema } from "./shared";

const CreationCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true },
    fullDescription: { type: String, default: "" },
    heroEyebrow: String,
    heroHeading: String,
    heroSubheading: String,
    heroImage: MediaRefSchema,
    images: [MediaRefSchema],
    creationProcess: [
      {
        title: String,
        description: String,
      },
    ],
    careInformation: String,
    safetyInformation: String,
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    options: [String],
    ctaLabel: { type: String, default: "Shop this collection" },
    ctaLink: String,
    customOrderCta: { type: String, default: "Request a custom piece" },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    seo: SeoSchema,
  },
  { timestamps: true },
);

export type CreationCategoryDocument = InferSchemaType<
  typeof CreationCategorySchema
> & { _id: Schema.Types.ObjectId };

export const CreationCategory = getModel<CreationCategoryDocument>(
  "CreationCategory",
  CreationCategorySchema,
);
