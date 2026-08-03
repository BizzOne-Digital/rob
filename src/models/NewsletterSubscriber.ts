import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "./shared";

const NewsletterSubscriberSchema = new Schema(
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
    consentedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    source: { type: String, default: "website" },
  },
  { timestamps: true },
);

export type NewsletterSubscriberDocument = InferSchemaType<
  typeof NewsletterSubscriberSchema
> & { _id: Schema.Types.ObjectId };

export const NewsletterSubscriber = getModel<NewsletterSubscriberDocument>(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema,
);
