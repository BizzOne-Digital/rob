import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema, SeoSchema } from "./shared";

const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true },
);

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: String,
    content: { type: String, default: "" },
    featuredImage: MediaRefSchema,
    contentImages: [MediaRefSchema],
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "BlogCategory" }],
    tags: [String],
    author: { type: String, default: "RW Designs Canada" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: Date,
    seo: SeoSchema,
  },
  { timestamps: true },
);

export type BlogCategoryDocument = InferSchemaType<typeof BlogCategorySchema> & {
  _id: Schema.Types.ObjectId;
};
export type BlogPostDocument = InferSchemaType<typeof BlogPostSchema> & {
  _id: Schema.Types.ObjectId;
};

export const BlogCategory = getModel<BlogCategoryDocument>(
  "BlogCategory",
  BlogCategorySchema,
);
export const BlogPost = getModel<BlogPostDocument>("BlogPost", BlogPostSchema);
