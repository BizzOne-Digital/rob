import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const InquirySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["general", "product", "custom_order", "existing_order", "wholesale"],
      default: "general",
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    orderNumber: String,
    productSlug: String,
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true,
    },
    adminNotes: String,
  },
  { timestamps: true },
);

export type InquiryDocument = InferSchemaType<typeof InquirySchema> & {
  _id: Schema.Types.ObjectId;
};

export const Inquiry = getModel<InquiryDocument>("Inquiry", InquirySchema);
