import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const CustomerSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: String,
    phone: String,
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    notes: String,
    addresses: [
      {
        label: String,
        fullName: String,
        line1: String,
        line2: String,
        city: String,
        province: String,
        postalCode: String,
        country: String,
        phone: String,
      },
    ],
    wishlistProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

export type CustomerDocument = InferSchemaType<typeof CustomerSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Customer = getModel<CustomerDocument>("Customer", CustomerSchema);
