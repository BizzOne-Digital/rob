/**
 * Sync published catalog prices + customization flags from current listing data.
 * Run:
 *   $env:MONGODB_URI="mongodb://127.0.0.1:27017/rw-designs-canada"; npx tsx scripts/update-catalog-pricing.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/rw-designs-canada";
}

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Product } from "../src/models/Product";
import { PricingItem } from "../src/models/PricingItem";

const PRICES: Record<string, number> = {
  "sunflower-car-mirror-air-freshener": 11.99,
  "silicone-keychain-charm-bee-focal-bead": 9.71,
  "mama-car-mirror-air-freshener": 11.99,
  "soy-wax-melts-strong-long-lasting-fragrance": 6.0,
  "dripping-cherries-car-mirror-air-freshener": 11.99,
  "butterfly-car-vent-clip-freshie": 8.99,
  "highland-cow-car-vent-clip-air-freshener": 7.49,
  "dog-mom-keychain-retro-beaded-charm": 9.71,
  "silicone-wristlet-keychain-purple": 14.2,
  "silicone-wristlet-keychain-leaf-beads": 14.2,
  "soy-wax-melts-1-oz-cube": 3.0,
  "engraved-birth-month-flower-keychain": 7.49,
  "humorous-car-vent-clip-freshie-my-driving-scares-me-too": 7.49,
  "sunflower-car-vent-clip-air-freshener": 7.49,
};

/** Only true name/engraving customization — not scent/colour option picks. */
const CUSTOMIZATION_SLUGS = new Set([
  "engraved-birth-month-flower-keychain",
]);

async function main() {
  await connectDB();

  for (const [slug, price] of Object.entries(PRICES)) {
    const product = await Product.findOne({ slug });
    if (!product) {
      console.log(`skip missing ${slug}`);
      continue;
    }

    const customization = CUSTOMIZATION_SLUGS.has(slug);
    product.price = price;
    product.priceVisibility = "show";
    product.personalizable = customization;

    if (
      slug === "engraved-birth-month-flower-keychain" &&
      product.variants?.length
    ) {
      for (const v of product.variants) {
        if (/no thank you/i.test(v.name)) v.price = 7.49;
        if (/yes please/i.test(v.name)) v.price = 9.71;
      }
    }

    await product.save();

    await PricingItem.findOneAndUpdate(
      { productId: product._id, variantId: null },
      {
        productId: product._id,
        variantId: null,
        productName: product.name,
        regularPrice: price,
        salePrice: null,
        priceVisibility: "show",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (product.variants?.length) {
      for (const v of product.variants) {
        await PricingItem.findOneAndUpdate(
          { productId: product._id, variantId: String(v._id) },
          {
            productId: product._id,
            variantId: String(v._id),
            productName: product.name,
            variantName: v.name,
            regularPrice: v.price ?? price,
            salePrice: null,
            priceVisibility: "show",
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    }

    console.log(
      `ok ${slug} → $${price.toFixed(2)} customization=${customization}`,
    );
  }

  const cleared = await Product.updateMany(
    {
      slug: { $nin: [...CUSTOMIZATION_SLUGS] },
      personalizable: true,
    },
    { $set: { personalizable: false } },
  );
  console.log(`cleared personalizable on ${cleared.modifiedCount} other products`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
