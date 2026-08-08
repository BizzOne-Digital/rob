/**
 * Sync published catalog prices exactly from client listing screenshots.
 * Run: npx tsx scripts/update-catalog-pricing.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/rw-designs-canada";
}

/** Exact screenshot prices — do not round or alter cents. */
const PRICES: Record<string, number> = {
  "mama-car-mirror-air-freshener": 11.99,
  "dripping-cherries-car-mirror-air-freshener": 11.99,
  "butterfly-car-vent-clip-freshie": 8.99,
  "highland-cow-car-vent-clip-air-freshener": 7.49,
  "dog-mom-keychain-retro-beaded-charm": 9.71,
  "silicone-keychain-charm-bee-focal-bead": 9.71,
  "silicone-wristlet-keychain-purple": 14.2,
  "silicone-wristlet-keychain-leaf-beads": 14.2,
  "soy-wax-melts-strong-long-lasting-fragrance": 6.0,
  "soy-wax-melts-1-oz-cube": 3.0,
  "engraved-birth-month-flower-keychain": 7.49,
  "humorous-car-vent-clip-freshie-my-driving-scares-me-too": 7.49,
  "sunflower-car-mirror-air-freshener": 11.99,
  "sunflower-car-vent-clip-air-freshener": 7.49,
};

const ENGRAVED_VARIANTS: Record<string, number> = {
  "no thank you": 7.49,
  "yes please": 9.71,
};

/** Only true name/engraving customization — not scent/colour option picks. */
const CUSTOMIZATION_SLUGS = new Set([
  "engraved-birth-month-flower-keychain",
]);

async function main() {
  const { default: mongoose } = await import("mongoose");
  const { connectDB } = await import("../src/lib/db");
  const { Product } = await import("../src/models/Product");
  const { PricingItem } = await import("../src/models/PricingItem");

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

    if (slug === "engraved-birth-month-flower-keychain" && product.variants?.length) {
      for (const v of product.variants) {
        const key = String(v.name || "")
          .trim()
          .toLowerCase();
        if (key in ENGRAVED_VARIANTS) {
          v.price = ENGRAVED_VARIANTS[key];
        }
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

    console.log(`ok ${slug} → $${price.toFixed(2)} customization=${customization}`);
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
