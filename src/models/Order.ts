import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const AddressSchema = new Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: "CA" },
  },
  { _id: false },
);

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    variantId: String,
    name: { type: String, required: true },
    slug: String,
    sku: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    variantLabel: String,
    personalization: [
      {
        fieldId: String,
        label: String,
        value: String,
        fileUrl: String,
      },
    ],
  },
  { _id: true },
);

const TimelineEventSchema = new Schema(
  {
    status: String,
    note: String,
    visibleToCustomer: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: String,
  },
  { _id: true },
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    email: { type: String, required: true, index: true },
    phone: String,
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    discountCode: String,
    shippingAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "CAD" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "confirmed",
        "in_production",
        "ready_for_pickup",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending_payment",
      index: true,
    },
    billingAddress: AddressSchema,
    shippingAddress: AddressSchema,
    shippingMethod: {
      id: String,
      name: String,
      price: Number,
    },
    trackingNumber: String,
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, index: true },
    stripeEventIds: [String],
    customerNotes: String,
    internalNotes: String,
    customerVisibleNotes: String,
    refundStatus: String,
    timeline: [TimelineEventSchema],
    paidAt: Date,
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof OrderSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Order = getModel<OrderDocument>("Order", OrderSchema);
