import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const FAQSchema = new Schema(
  {
    category: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

FAQSchema.index({ published: 1, category: 1, displayOrder: 1 });

export type FAQDocument = InferSchemaType<typeof FAQSchema> & {
  _id: Schema.Types.ObjectId;
};

export const FAQ = getModel<FAQDocument>("FAQ", FAQSchema);
