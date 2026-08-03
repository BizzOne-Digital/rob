import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema, SeoSchema } from "./shared";

const PersonalizationFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "select", "file", "color"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    maxLength: Number,
    options: [String],
    helpText: String,
  },
  { _id: false },
);

const ProductVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    sku: String,
    options: { type: Map, of: String },
    price: { type: Number, default: null },
    compareAtPrice: { type: Number, default: null },
    cost: { type: Number, default: null },
    inventory: { type: Number, default: 0 },
    trackInventory: { type: Boolean, default: true },
    image: MediaRefSchema,
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "CreationCategory" },
    categorySlug: { type: String, index: true },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    price: { type: Number, default: null },
    compareAtPrice: { type: Number, default: null },
    cost: { type: Number, default: null },
    priceVisibility: {
      type: String,
      enum: ["show", "contact"],
      default: "contact",
    },
    saleStartsAt: Date,
    saleEndsAt: Date,
    sku: String,
    inventory: { type: Number, default: 0 },
    trackInventory: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    images: [MediaRefSchema],
    videoUrl: String,
    optionDefinitions: [
      {
        name: String,
        values: [String],
      },
    ],
    variants: [ProductVariantSchema],
    scent: String,
    colour: String,
    size: String,
    material: String,
    waxType: String,
    wickType: String,
    vessel: String,
    burnTime: String,
    dimensions: String,
    personalizable: { type: Boolean, default: false },
    personalizationFields: [PersonalizationFieldSchema],
    productionTime: String,
    careInstructions: String,
    safetyInformation: String,
    shippingInformation: String,
    featured: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false },
    badge: String,
    giftOccasions: [String],
    relatedProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    seo: SeoSchema,
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", shortDescription: "text" });
ProductSchema.index({ status: 1, featured: 1 });
ProductSchema.index({ status: 1, categorySlug: 1 });

export type ProductVariantDocument = InferSchemaType<typeof ProductVariantSchema>;
export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Product = getModel<ProductDocument>("Product", ProductSchema);
