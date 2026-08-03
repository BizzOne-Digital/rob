import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: String,
    name: String,
    slug: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantLabel: String,
    personalization: [
      {
        fieldId: String,
        label: String,
        value: String,
        fileUrl: String,
      },
    ],
    personalizable: Boolean,
  },
  { _id: true },
);

const CartSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    items: [CartItemSchema],
    discountCode: String,
    notes: String,
  },
  { timestamps: true },
);

export type CartDocument = InferSchemaType<typeof CartSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Cart = getModel<CartDocument>("Cart", CartSchema);
