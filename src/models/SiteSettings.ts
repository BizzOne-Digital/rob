import { Schema, type InferSchemaType } from "mongoose";
import { getModel, MediaRefSchema } from "./shared";

const SiteSettingsSchema = new Schema(
  {
    singletonKey: { type: String, default: "site", unique: true },
    businessName: { type: String, default: "RW Designs Canada" },
    email: { type: String, default: "rwdesignscanada@gmail.com" },
    phone: { type: String, default: "905-541-8699" },
    instagram: { type: String, default: "@rwdesignsca" },
    instagramUrl: {
      type: String,
      default: "https://www.instagram.com/rwdesignsca",
    },
    facebookUrl: {
      type: String,
      default:
        "https://www.facebook.com/share/1M1epyWaiZ/?mibextid=wwXIfr",
    },
    address: String,
    headline: {
      type: String,
      default: "Beautifully handmade. Thoughtfully designed.",
    },
    currency: { type: String, default: "CAD" },
    logoLight: MediaRefSchema,
    logoDark: MediaRefSchema,
    favicon: MediaRefSchema,
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default:
          "Handmade gifts & home fragrance — crafted with care by RW Designs Canada",
      },
      link: String,
    },
    introWrapper: {
      enabled: { type: Boolean, default: true },
      durationMs: { type: Number, default: 3500 },
    },
    navigation: {
      showBlog: { type: Boolean, default: false },
      items: [
        {
          label: String,
          href: String,
          visible: { type: Boolean, default: true },
          children: [
            {
              label: String,
              href: String,
              visible: { type: Boolean, default: true },
            },
          ],
        },
      ],
    },
    footer: {
      tagline: {
        type: String,
        default: "Beautifully handmade. Thoughtfully designed.",
      },
      copyright: {
        type: String,
        default: "RW Designs Canada. All rights reserved.",
      },
    },
    tax: {
      enabled: { type: Boolean, default: true },
      rate: { type: Number, default: 0.13 },
      label: { type: String, default: "HST" },
      includedInPrice: { type: Boolean, default: false },
    },
    shipping: {
      localPickup: {
        enabled: { type: Boolean, default: true },
        label: { type: String, default: "Local Pickup" },
        instructions: {
          type: String,
          default:
            "Pickup details and timing will be confirmed after your order is ready.",
        },
        price: { type: Number, default: 0 },
      },
      flatRate: {
        enabled: { type: Boolean, default: true },
        label: { type: String, default: "Canada-wide Shipping" },
        price: { type: Number, default: null },
        note: {
          type: String,
          default:
            "Shipping rates are configurable. Exact cost shown at checkout once set.",
        },
      },
      freeShippingThreshold: { type: Number, default: null },
      provinceRates: [
        {
          province: String,
          price: Number,
        },
      ],
      internationalEnabled: { type: Boolean, default: false },
      defaultProductionTime: {
        type: String,
        default: "Production times vary by item and will be confirmed at checkout or by email.",
      },
      estimatedDispatch: {
        type: String,
        default: "Dispatch estimates are provided once production is complete.",
      },
    },
    contactRecipientEmail: {
      type: String,
      default: "rwdesignscanada@gmail.com",
    },
    orderEmailSender: String,
    defaultSeo: {
      title: {
        type: String,
        default: "RW Designs Canada | Beautifully Handmade Gifts",
      },
      description: {
        type: String,
        default:
          "Discover handcrafted candles, wax melts, personalized gifts, beaded keychains, wood signs, and custom creations by RW Designs Canada.",
      },
      ogImage: String,
    },
    analytics: {
      googleAnalyticsId: String,
      metaPixelId: String,
    },
    stripeConfigured: { type: Boolean, default: false },
    wholesaleInquiriesEnabled: { type: Boolean, default: false },
    policies: {
      privacy: String,
      terms: String,
      shippingReturns: String,
      customOrder: String,
      draftNotice: {
        type: String,
        default:
          "This policy content is a draft pending client and legal review.",
      },
    },
  },
  { timestamps: true },
);

export type SiteSettingsDocument = InferSchemaType<typeof SiteSettingsSchema> & {
  _id: Schema.Types.ObjectId;
};

export const SiteSettings = getModel<SiteSettingsDocument>(
  "SiteSettings",
  SiteSettingsSchema,
);
