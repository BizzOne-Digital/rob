import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

/** Denormalized pricing rows for bulk admin management */
const PricingItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: String,
    productName: { type: String, required: true },
    variantName: String,
    sku: String,
    regularPrice: { type: Number, default: null },
    salePrice: { type: Number, default: null },
    cost: { type: Number, default: null },
    priceVisibility: {
      type: String,
      enum: ["show", "contact"],
      default: "contact",
    },
    saleStartsAt: Date,
    saleEndsAt: Date,
  },
  { timestamps: true },
);

PricingItemSchema.index({ productId: 1, variantId: 1 }, { unique: true });

export type PricingItemDocument = InferSchemaType<typeof PricingItemSchema> & {
  _id: Schema.Types.ObjectId;
};

export const PricingItem = getModel<PricingItemDocument>(
  "PricingItem",
  PricingItemSchema,
);
