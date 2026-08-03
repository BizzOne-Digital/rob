import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema } from "./shared";

const TestimonialSchema = new Schema(
  {
    customerName: { type: String, required: true },
    reviewText: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: String,
    image: MediaRefSchema,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    featured: { type: Boolean, default: false },
    approved: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type TestimonialDocument = InferSchemaType<typeof TestimonialSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Testimonial = getModel<TestimonialDocument>(
  "Testimonial",
  TestimonialSchema,
);
