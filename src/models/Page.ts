import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema, SeoSchema } from "./shared";

const PageSectionSchema = new Schema(
  {
    key: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "hero",
        "text",
        "image",
        "image_grid",
        "cta",
        "faq",
        "process",
        "categories",
        "products",
        "gallery",
        "testimonials",
        "newsletter",
        "custom_form",
        "gift_inspiration",
        "marquee",
        "split",
        "rich",
      ],
    },
    eyebrow: String,
    heading: String,
    subheading: String,
    body: String,
    bullets: [String],
    ctaLabel: String,
    ctaLink: String,
    secondaryCtaLabel: String,
    secondaryCtaLink: String,
    images: [MediaRefSchema],
    background: String,
    layout: { type: String, default: "default" },
    visible: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

const PageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    path: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    sections: [PageSectionSchema],
    seo: SeoSchema,
    showInNav: { type: Boolean, default: true },
    navLabel: String,
    navOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type PageSectionDocument = InferSchemaType<typeof PageSectionSchema>;
export type PageDocument = InferSchemaType<typeof PageSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Page = getModel<PageDocument>("Page", PageSchema);
