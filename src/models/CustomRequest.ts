import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema } from "./shared";

const CustomRequestSchema = new Schema(
  {
    creationType: { type: String, required: true },
    occasion: String,
    description: { type: String, required: true },
    preferredWording: String,
    colours: String,
    quantity: { type: Number, default: 1 },
    budgetRange: String,
    neededBy: Date,
    referenceImages: [MediaRefSchema],
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: String,
    additionalNotes: String,
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["new", "reviewing", "quoted", "accepted", "declined", "completed"],
      default: "new",
      index: true,
    },
    adminNotes: String,
  },
  { timestamps: true },
);

export type CustomRequestDocument = InferSchemaType<
  typeof CustomRequestSchema
> & { _id: Schema.Types.ObjectId };

export const CustomRequest = getModel<CustomRequestDocument>(
  "CustomRequest",
  CustomRequestSchema,
);
