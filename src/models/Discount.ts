import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const DiscountSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0 },
    maxUses: Number,
    usedCount: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
    active: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true },
);

export type DiscountDocument = InferSchemaType<typeof DiscountSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Discount = getModel<DiscountDocument>("Discount", DiscountSchema);
