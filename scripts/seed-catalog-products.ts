/**
 * Seed client-provided catalog products (batch 1–13).
 * Run: npx tsx --tsconfig tsconfig.json scripts/seed-catalog-products.ts
 *
 * Note: set MONGODB_URI in the shell if dotenv loads after module imports:
 *   $env:MONGODB_URI="mongodb://127.0.0.1:27017/rw-designs-canada"; npm run seed:catalog
 */
import { config } from "dotenv";
import path from "path";

// Load env before other local imports execute their top-level checks
config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/rw-designs-canada";
}

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Product } from "../src/models/Product";
import { CreationCategory } from "../src/models/CreationCategory";
import { PricingItem } from "../src/models/PricingItem";
import { ActivityLog } from "../src/models/ActivityLog";
import { slugify } from "../src/lib/utils";
import { PLACEHOLDER_IMAGES } from "../src/lib/constants";

const FRESHIE_SCENTS = [
  "Lemon",
  "Passion Fruit",
  "Coconut Vanilla",
  "Gardenia",
  "Sweet Orange",
  "Green Apple",
] as const;

const FRESHIE_COLOURS = [
  "Yellow/Gold",
  "Pink",
  "Purple",
  "Dark Blue",
  "Light Blue",
  "White",
  "Black",
  "Orange",
  "Green",
] as const;

const WAX_SCENTS_LARGE = [
  "Fiji Coconut",
  "Strawberry Swirl",
  "Fresh Pear",
  "Champagne Rose",
  "Red Berry Citrus",
  "Jasmine",
] as const;

const WAX_SCENTS_CUBE = [
  "Fierce",
  "Fresh Pear",
  "Strawberry Swirl",
  "Black Cherry",
] as const;

/** July–December birth month flower options (Jan–June on a separate listing) */
const BIRTH_MONTH_FLOWERS = [
  "July - Larkspur",
  "July - Water Lily",
  "August - Gladiolus",
  "August - Poppy",
  "September - Aster",
  "Sept - Morning Glory",
  "October - Marigold",
  "October - Cosmos",
  "Nov - Chrysanthemum",
  "November - Peonies",
  "Dec - Holly Berry",
  "December - Narcissus",
] as const;

function img(url: string, alt: string) {
  return { url, alt, caption: alt };
}

type PersonalizationFieldSeed = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "file" | "color";
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: string[];
  helpText?: string;
};

type VariantSeed = {
  name: string;
  price: number;
  available?: boolean;
  inventory?: number;
};

function scentField(options: readonly string[]): PersonalizationFieldSeed {
  return {
    id: "scent",
    label: "Choose a scent",
    type: "select",
    required: true,
    options: [...options],
    helpText: "Select your preferred fragrance",
  };
}

function colourField(
  options: readonly string[] = FRESHIE_COLOURS,
): PersonalizationFieldSeed {
  return {
    id: "colour",
    label: "Choose a colour",
    type: "select",
    required: true,
    options: [...options],
    helpText: "Select your preferred colour",
  };
}

type CatalogProduct = {
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  shortDescription: string;
  fullDescription: string;
  material?: string;
  dimensions?: string;
  waxType?: string;
  images: ReturnType<typeof img>[];
  personalizationFields?: PersonalizationFieldSeed[];
  optionDefinitions?: { name: string; values: string[] }[];
  variants?: VariantSeed[];
  featured?: boolean;
  newArrival?: boolean;
  careInstructions?: string;
  shippingInformation?: string;
  badge?: string;
};

const products: CatalogProduct[] = [
  {
    name: "Sunflower Car Mirror Air Freshener",
    slug: "sunflower-car-mirror-air-freshener",
    categorySlug: "freshies",
    price: 11.91,
    badge: "Freshie",
    featured: true,
    newArrival: true,
    shortDescription:
      "Handmade sunflower freshie — cheerful car décor with customizable scent and colour.",
    fullDescription: `Bring sunshine wherever you go with this cheerful Sunflower Freshie! Handmade with care, this air freshener adds a burst of color to your car, closet or bathroom. Whether you are gifting it to a friend or keeping it for yourself, this handmade beauty brings a little sunshine wherever it hangs! The photo shown is an example - each one can be customized in different colors and fragrances. See available options for details.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material:
      "Scented aroma beads, Mica powder, Nylon string, metal hook, Plastic snap closure, Sparkle",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Sunflower car mirror air freshener"),
      img(PLACEHOLDER_IMAGES.gift, "Sunflower freshie gift packaging"),
      img(PLACEHOLDER_IMAGES.home, "Freshie styled in home décor"),
      img(PLACEHOLDER_IMAGES.packaging, "Holographic scent-proof packaging"),
      img(PLACEHOLDER_IMAGES.gallery1, "Handmade freshie detail"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Hang in a well-ventilated area. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
  {
    name: "Silicone Keychain Charm | Bee Focal Bead",
    slug: "silicone-keychain-charm-bee-focal-bead",
    categorySlug: "beaded-keychains",
    price: 9.64,
    badge: "Keychain",
    featured: true,
    shortDescription:
      "Bee Humble, Bee True, Bee Wild, Bee You — soft silicone beaded keychain, approx. 6\".",
    fullDescription: `Our Bee silicone beaded keychain features a round focal bead with the uplifting message Bee Humble, Bee True, Bee Wild, Bee You! Made from soft, durable silicone, it's a lightweight, everyday accessory that reminds you of your unique strength! Attach it to keys, purses or bags and carry positivity wherever you go!

Approximately 6" including key ring.`,
    material: "Silicone, steel",
    dimensions: "Approximately 6 inches including key ring",
    images: [
      img(PLACEHOLDER_IMAGES.keychain, "Bee silicone beaded keychain"),
      img(PLACEHOLDER_IMAGES.gift, "Bee keychain gift ready"),
      img(PLACEHOLDER_IMAGES.hands, "Handmade beaded keychain detail"),
      img(PLACEHOLDER_IMAGES.packaging, "Keychain packaging"),
      img(PLACEHOLDER_IMAGES.gallery3, "Beaded keychain close-up"),
    ],
  },
  {
    name: "Mama Car Mirror Air Freshener",
    slug: "mama-car-mirror-air-freshener",
    categorySlug: "freshies",
    price: 11.91,
    badge: "Freshie",
    featured: true,
    shortDescription:
      "Sweet “Mama” car mirror freshie — cozy, personal, and customizable by scent and colour.",
    fullDescription: `Add a sweet, personal touch to your car with our “Mama” Car Mirror Air Freshener.

Designed for everyday drives, this freshie features a meaningful “mama” design that makes it perfect for moms who want their space to feel cozy, calm, and uniquely theirs. Not only does it look beautiful hanging from your rearview mirror, but it also fills your car with a refreshing scent.

Perfect for moms or as a thoughtful gift.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material:
      "Scented aroma beads, Mica powder, Nylon string, metal hook, Plastic snap closure, Sparkle",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Mama car mirror air freshener"),
      img(PLACEHOLDER_IMAGES.gift, "Mama freshie gift packaging"),
      img(PLACEHOLDER_IMAGES.home, "Mama freshie in everyday space"),
      img(PLACEHOLDER_IMAGES.packaging, "Scent-proof holographic bag"),
      img(PLACEHOLDER_IMAGES.gallery2, "Handmade mama freshie"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Hang in a well-ventilated area. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
  {
    name: "Soy Wax Melts | Strong Long-Lasting Fragrance",
    slug: "soy-wax-melts-strong-long-lasting-fragrance",
    categorySlug: "wax-melts-and-candles",
    price: 5.96,
    badge: "Wax Melts",
    featured: true,
    newArrival: true,
    shortDescription:
      "Hand-poured 100% soy wax melts — non-toxic, highly scented, made in Canada.",
    fullDescription: `Fill your home with beautiful, long-lasting fragrance — naturally. Our hand-poured 100% soy wax melts are made in small batches using premium, non-toxic fragrance oils for a clean, safe scent experience you can feel good about.

Simply place a cube in your favourite wax warmer and enjoy hours of rich aroma — no flame, no soot, just pure fragrance. Perfect for creating a cozy atmosphere in any room or gifting to someone special.

Product Details:
• Hand-poured in Canada
• 100% natural soy wax
• Non-toxic, paraben and phthalate-free fragrance oils
• Long-lasting and highly scented
• Compatible with all wax warmers
• Perfect for gifts, self-care, or everyday use

Transform your space with natural fragrance — one melt at a time.`,
    material: "Soy wax, premium fragrance oils",
    waxType: "Soy",
    dimensions: "Width 2.25 in · Height 3 in · Depth 0.875 in · Volume 2.4 fl oz",
    images: [
      img(PLACEHOLDER_IMAGES.waxMelts, "Soy wax melts"),
      img(PLACEHOLDER_IMAGES.candle, "Hand-poured soy fragrance"),
      img(PLACEHOLDER_IMAGES.home, "Wax melts in a cozy space"),
      img(PLACEHOLDER_IMAGES.gift, "Wax melts gift ready"),
      img(PLACEHOLDER_IMAGES.packaging, "Soy wax melt packaging"),
    ],
    optionDefinitions: [{ name: "Scent", values: [...WAX_SCENTS_LARGE] }],
    personalizationFields: [scentField(WAX_SCENTS_LARGE)],
    careInstructions:
      "Use in a wax warmer only. Never leave unattended. Keep away from children and pets. Do not ingest.",
  },
  {
    name: "Dripping Cherries Car Mirror Air Freshener",
    slug: "dripping-cherries-car-mirror-air-freshener",
    categorySlug: "freshies",
    price: 11.91,
    badge: "Freshie",
    featured: true,
    shortDescription:
      "Bold and sweet dripping cherries freshie — customize scent and colour.",
    fullDescription: `Bring a bold and sweet touch to your space with our Dripping Cherries Freshie. Handmade with care, this air freshener adds a burst of color to your car, closet or bathroom. Whether you are gifting it to a friend or keeping it for yourself, this handmade beauty brings a little sunshine wherever it hangs! The photo shown is an example - each one can be customized in different colors and fragrances. See available options for details.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material:
      "Scented aroma beads, Mica powder, Nylon string, metal hook, Plastic snap closure, Sparkle",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Dripping cherries car mirror freshie"),
      img(PLACEHOLDER_IMAGES.gift, "Cherries freshie packaging"),
      img(PLACEHOLDER_IMAGES.home, "Cherries freshie décor"),
      img(PLACEHOLDER_IMAGES.packaging, "Holographic scent-proof bag"),
      img(PLACEHOLDER_IMAGES.gallery2, "Handmade cherries freshie detail"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Hang in a well-ventilated area. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
  {
    name: "Butterfly Car Vent Clip Freshie",
    slug: "butterfly-car-vent-clip-freshie",
    categorySlug: "freshies",
    price: 8.93,
    badge: "Vent Clip",
    featured: true,
    shortDescription:
      "Adorable butterfly vent-clip freshie with customizable scent and colour.",
    fullDescription: `Give your car a fresh little glow-up with this adorable butterfly vent clip Freshie! This stylish car air freshener blends cute decor with your favorite fragrance, turning everyday drives into a more enjoyable experience. The photo shown is an example - each one comes with a vent clip and can be customized in different colors and fragrances. See available options for details.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material: "Acrylic, plastic, aroma beads, fragrance oils",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Butterfly car vent clip freshie"),
      img(PLACEHOLDER_IMAGES.gift, "Butterfly freshie gift packaging"),
      img(PLACEHOLDER_IMAGES.home, "Butterfly freshie styled"),
      img(PLACEHOLDER_IMAGES.packaging, "Scent-proof packaging"),
      img(PLACEHOLDER_IMAGES.gallery1, "Butterfly freshie detail"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Clip to a car vent as directed. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
  {
    name: "Highland Cow Car Vent Clip Air Freshener",
    slug: "highland-cow-car-vent-clip-air-freshener",
    categorySlug: "freshies",
    price: 7.44,
    badge: "Vent Clip",
    newArrival: true,
    shortDescription:
      "Charming highland cow vent-clip freshie — choose your scent and colour.",
    fullDescription: `Meet the highland cow Freshie! A charming air freshener that can be infused with your choice of scent and color. Use the vent clip provided to hang from your car vent. The photo shown is an example - each one can be customized in different colors and fragrances. See available options for details.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material: "Aroma beads, Mica powder, Fragrance oil, Acrylic paint, Glitter",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Highland cow vent clip freshie"),
      img(PLACEHOLDER_IMAGES.gift, "Highland cow freshie packaging"),
      img(PLACEHOLDER_IMAGES.home, "Highland cow freshie décor"),
      img(PLACEHOLDER_IMAGES.packaging, "Holographic scent-proof bag"),
      img(PLACEHOLDER_IMAGES.gallery5, "Highland cow freshie detail"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Clip to a car vent as directed. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
  {
    name: "Dog Mom Keychain | Retro Beaded Charm",
    slug: "dog-mom-keychain-retro-beaded-charm",
    categorySlug: "beaded-keychains",
    price: 9.64,
    badge: "Keychain",
    featured: true,
    shortDescription:
      "Retro dog mom silicone beaded keychain — playful lettering, approx. 6\".",
    fullDescription: `This cute keychain showcases bold and playful lettering that gives retro feels! Embrace your inner dog mom with this keychain and carry your love for your pet everywhere you go! With a colorful silicone dog mom focal bead and 3 round silicone beads, this keychain is the perfect blend of retro charm and modern functionality.

Approximately 6" including key ring.

Local delivery can be arranged for Hamilton, Ontario and surrounding area. Please message us if this would be an option for you.`,
    material: "Metal, silicone",
    dimensions: "Approximately 6 inches including key ring",
    images: [
      img(PLACEHOLDER_IMAGES.keychain, "Dog mom retro beaded keychain"),
      img(PLACEHOLDER_IMAGES.gift, "Dog mom keychain gift ready"),
      img(PLACEHOLDER_IMAGES.hands, "Handmade keychain detail"),
      img(PLACEHOLDER_IMAGES.packaging, "Keychain packaging"),
      img(PLACEHOLDER_IMAGES.gallery3, "Dog mom keychain close-up"),
    ],
    shippingInformation:
      "Local delivery can be arranged for Hamilton, Ontario and surrounding area. Contact us to arrange.",
  },
  {
    name: "Silicone Wristlet Keychain | Purple",
    slug: "silicone-wristlet-keychain-purple",
    categorySlug: "beaded-keychains",
    price: 14.1,
    badge: "Wristlet",
    featured: true,
    shortDescription:
      "Purple & black silicone wristlet with wood hexagon beads — easy-to-find key accessory.",
    fullDescription: `This silicone wristlet in pretty shades of purple and black is the perfect keychain accessory. A mix of 15 soft silicone and 3 wood hexagon beads make up this stylish keychain. Never lose your keys with this beautiful and easy to find wristlet. Makes the perfect gift!

Local delivery can be arranged for Hamilton, Ontario and surrounding area. Please message us if this would be an option for you.`,
    material: "Nylon, steel, wood, silicone",
    dimensions: "Length approximately 4 inches",
    images: [
      img(PLACEHOLDER_IMAGES.keychain, "Purple silicone wristlet keychain"),
      img(PLACEHOLDER_IMAGES.gift, "Wristlet keychain gift ready"),
      img(PLACEHOLDER_IMAGES.hands, "Wristlet on wrist detail"),
      img(PLACEHOLDER_IMAGES.packaging, "Wristlet packaging"),
      img(PLACEHOLDER_IMAGES.gallery3, "Purple wristlet beads close-up"),
    ],
    shippingInformation:
      "Local delivery can be arranged for Hamilton, Ontario and surrounding area. Contact us to arrange.",
  },
  {
    name: "Silicone Wristlet Keychain with Leaf Beads",
    slug: "silicone-wristlet-keychain-leaf-beads",
    categorySlug: "beaded-keychains",
    price: 14.1,
    badge: "Wristlet",
    newArrival: true,
    shortDescription:
      "Leaf focal beads, gold spacers, and gold keyring — soft silicone wristlet with 18 beads.",
    fullDescription: `Beautiful wristlet keychain with leaf focal beads, gold spacers and gold keyring. All beads are silicone which are soft and comfortable to wear on your wrist. Wristlet includes 18 silicone beads. Never lose your keys with this beautiful and easy to find wristlet. Makes the perfect gift!

Local delivery can be arranged for Hamilton, Ontario and surrounding area. Please message us if this would be an option for you.`,
    material: "Nylon, steel, silicone",
    images: [
      img(PLACEHOLDER_IMAGES.keychain, "Leaf bead silicone wristlet keychain"),
      img(PLACEHOLDER_IMAGES.gift, "Leaf wristlet gift ready"),
      img(PLACEHOLDER_IMAGES.hands, "Leaf wristlet detail"),
      img(PLACEHOLDER_IMAGES.packaging, "Wristlet packaging"),
      img(PLACEHOLDER_IMAGES.gallery4, "Leaf bead close-up"),
    ],
    shippingInformation:
      "Local delivery can be arranged for Hamilton, Ontario and surrounding area. Contact us to arrange.",
  },
  {
    name: "Soy Wax Melts | 1 oz Cube",
    slug: "soy-wax-melts-1-oz-cube",
    categorySlug: "wax-melts-and-candles",
    price: 2.98,
    badge: "Wax Melts",
    featured: true,
    shortDescription:
      "Hand-poured 1 oz soy wax melt cube — non-toxic, eco-friendly, made in Canada.",
    fullDescription: `Fill your home with beautiful, long-lasting fragrance — naturally. Our hand-poured 100% soy wax melts are made in small batches using premium, non-toxic fragrance oils for a clean, safe scent experience you can feel good about.

Simply place a cube in your favourite wax warmer and enjoy hours of rich aroma — no flame, no soot, just pure fragrance. Perfect for creating a cozy atmosphere in any room or gifting to someone special.

Product Details:
• Hand-poured in Canada
• 100% natural soy wax
• Non-toxic, paraben and phthalate-free fragrance oils
• Long-lasting and highly scented
• Compatible with all wax warmers
• Perfect for gifts, self-care, or everyday use

Transform your space with natural fragrance — one melt at a time.`,
    material: "Soy wax, premium fragrance oils",
    waxType: "Soy",
    dimensions: "Width 1.5 in · Height 1.5 in · Depth 1 in · Volume 1 fl oz",
    images: [
      img(PLACEHOLDER_IMAGES.waxMelts, "1 oz soy wax melt cube"),
      img(PLACEHOLDER_IMAGES.candle, "Soy wax melt fragrance"),
      img(PLACEHOLDER_IMAGES.home, "Wax melt in warmer setting"),
      img(PLACEHOLDER_IMAGES.gift, "Single cube gift ready"),
      img(PLACEHOLDER_IMAGES.packaging, "Eco-friendly wax melt packaging"),
    ],
    optionDefinitions: [{ name: "Scent", values: [...WAX_SCENTS_CUBE] }],
    personalizationFields: [scentField(WAX_SCENTS_CUBE)],
    careInstructions:
      "Use in a wax warmer only. Never leave unattended. Keep away from children and pets. Do not ingest.",
  },
  {
    name: "Engraved Birth Month Flower Keychain",
    slug: "engraved-birth-month-flower-keychain",
    categorySlug: "laser-engraved-items",
    price: 7.44,
    badge: "Personalized",
    featured: true,
    newArrival: true,
    shortDescription:
      "Laser-engraved wood keychain with birth month flower and birthstone charm — optional name engraving.",
    fullDescription: `Carry your story wherever you go with this laser engraved wood keychain featuring your birth month flower and a matching birthstone-colored charm. Perfect for adding a personalized touch to your keys, bags, or as a thoughtful gift. With two flower choices per month, you can pick the design that best fits your style and personality.

Personalization is available! Add a name to make your keychain extra special. Please note: Personalized designs may have slightly smaller flower and font sizes to ensure a clean, balanced engraving.

See our other listing for January to June months.`,
    material: "Basswood, gemstone, metal, wood",
    dimensions: "Length approximately 4.5 inches",
    images: [
      img(PLACEHOLDER_IMAGES.engraved, "Engraved birth month flower keychain"),
      img(PLACEHOLDER_IMAGES.keychain, "Birth month flower keychain charm"),
      img(PLACEHOLDER_IMAGES.gift, "Personalized keychain gift ready"),
      img(PLACEHOLDER_IMAGES.hands, "Laser engraved wood detail"),
      img(PLACEHOLDER_IMAGES.gallery4, "Birthstone charm close-up"),
    ],
    optionDefinitions: [
      { name: "Month and Flower", values: [...BIRTH_MONTH_FLOWERS] },
      {
        name: "Personalization",
        values: ["No thank you", "Yes please"],
      },
    ],
    variants: [
      {
        name: "No thank you",
        price: 7.44,
        available: true,
        inventory: 50,
      },
      {
        name: "Yes please",
        price: 9.68,
        available: true,
        inventory: 50,
      },
    ],
    personalizationFields: [
      {
        id: "month_flower",
        label: "Choose your month and flower",
        type: "select",
        required: true,
        options: [...BIRTH_MONTH_FLOWERS],
        helpText: "July–December options (January–June available on our other listing)",
      },
      {
        id: "engraving",
        label: "Personalization",
        type: "textarea",
        required: false,
        maxLength: 100,
        placeholder: "Enter the name or word to engrave",
        helpText:
          "Please enter the name or word you'd like engraved on your keychain. Note: Font and flower design will be slightly smaller to keep the engraving balanced and clean.",
      },
    ],
  },
  {
    name: "Humorous Car Vent Clip Freshie | My Driving Scares Me Too",
    slug: "humorous-car-vent-clip-freshie-my-driving-scares-me-too",
    categorySlug: "freshies",
    price: 7.44,
    badge: "Vent Clip",
    featured: true,
    shortDescription:
      "Funny round vent-clip freshie — “My driving scares me too” — customize scent and colour.",
    fullDescription: `A playful round vent clip car Freshie featuring the humorous phrase "My driving scares me too". It adds a touch of fun and delightful fragrance to your car, making every drive a bit brighter and more enjoyable. The photo shown is an example - each one can be customized in different colors and fragrances. See available options for details.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material: "Acrylic, plastic, aroma beads, fragrance oils",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Humorous car vent clip freshie"),
      img(PLACEHOLDER_IMAGES.gift, "Funny freshie gift packaging"),
      img(PLACEHOLDER_IMAGES.home, "Vent clip freshie in car"),
      img(PLACEHOLDER_IMAGES.packaging, "Scent-proof holographic bag"),
      img(PLACEHOLDER_IMAGES.gallery1, "Round funny saying freshie"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Clip to a car vent as directed. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
  {
    name: "Sunflower Car Vent Clip Air Freshener",
    slug: "sunflower-car-vent-clip-air-freshener",
    categorySlug: "freshies",
    price: 7.44,
    badge: "Vent Clip",
    newArrival: true,
    shortDescription:
      "Cute sunflower vent-clip freshie — bright décor with customizable scent and colour.",
    fullDescription: `Cute Sunflower shaped Freshie that clips right to your car vent. It adds a touch of brightness and lovely fragrance to your car. The photo shown is an example - each one can be customized in different colors and fragrances. See available options for details.

Our Freshies are scented air fresheners made from high-quality aroma beads and infused with premium fragrance oils. They're perfect for your car, locker, closet, drawers, or anywhere you'd like to enjoy their scent. Each Freshie stays fragrant for approximately 4 to 6 weeks.

Each Freshie comes sealed in a scent-proof holographic plastic bag, labeled with the fragrance on the front and care instructions on the back - making them a perfect ready-to-gift item!`,
    material: "Aroma beads, Mica powder, Fragrance oil, Acrylic paint, Glitter",
    images: [
      img(PLACEHOLDER_IMAGES.freshie, "Sunflower car vent clip freshie"),
      img(PLACEHOLDER_IMAGES.gift, "Sunflower vent clip packaging"),
      img(PLACEHOLDER_IMAGES.home, "Sunflower vent clip décor"),
      img(PLACEHOLDER_IMAGES.packaging, "Holographic scent-proof bag"),
      img(PLACEHOLDER_IMAGES.gallery2, "Sunflower vent clip detail"),
    ],
    optionDefinitions: [
      { name: "Scent", values: [...FRESHIE_SCENTS] },
      { name: "Colour", values: [...FRESHIE_COLOURS] },
    ],
    personalizationFields: [scentField(FRESHIE_SCENTS), colourField()],
    careInstructions:
      "Clip to a car vent as directed. Fragrance lasts approximately 4–6 weeks. Keep away from extreme heat. Not for consumption.",
  },
];

async function syncPricing(
  productId: mongoose.Types.ObjectId,
  data: CatalogProduct,
  variants?: Array<{ _id: mongoose.Types.ObjectId; name: string; price?: number | null }>,
) {
  await PricingItem.findOneAndUpdate(
    { productId, variantId: null },
    {
      productId,
      variantId: null,
      productName: data.name,
      variantName: undefined,
      sku: undefined,
      regularPrice: data.price,
      salePrice: null,
      cost: null,
      priceVisibility: "show",
      saleStartsAt: null,
      saleEndsAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!variants?.length) return;

  for (const variant of variants) {
    await PricingItem.findOneAndUpdate(
      { productId, variantId: String(variant._id) },
      {
        productId,
        variantId: String(variant._id),
        productName: data.name,
        variantName: variant.name,
        regularPrice: variant.price ?? data.price,
        salePrice: null,
        cost: null,
        priceVisibility: "show",
        saleStartsAt: null,
        saleEndsAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  await connectDB();

  const categories = await CreationCategory.find({}).lean();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  let upserted = 0;

  for (const item of products) {
    const category = bySlug.get(item.categorySlug);
    if (!category) {
      throw new Error(`Missing category: ${item.categorySlug}`);
    }

    const slug = item.slug || slugify(item.name);
    const payload = {
      name: item.name,
      slug,
      categoryId: category._id,
      categorySlug: item.categorySlug,
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription,
      price: item.price,
      compareAtPrice: null,
      priceVisibility: "show" as const,
      status: "published" as const,
      inventory: 50,
      trackInventory: true,
      images: item.images.slice(0, 2),
      material: item.material,
      dimensions: item.dimensions,
      waxType: item.waxType,
      optionDefinitions: item.optionDefinitions ?? [],
      personalizationFields: item.personalizationFields ?? [],
      variants: (item.variants ?? []).map((v) => ({
        name: v.name,
        price: v.price,
        available: v.available ?? true,
        inventory: v.inventory ?? 50,
        trackInventory: true,
      })),
      personalizable:
        (item.personalizationFields?.length ?? 0) > 0 ||
        (item.variants?.length ?? 0) > 0,
      featured: false,
      newArrival: false,
      badge: null,
      careInstructions: item.careInstructions,
      shippingInformation: item.shippingInformation,
      seo: {
        title: `${item.name} | RW Designs Canada`,
        description: item.shortDescription,
      },
    };

    const doc = await Product.findOneAndUpdate({ slug }, payload, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      overwrite: false,
    });

    // Replace variants cleanly on update
    if (item.variants?.length) {
      doc.variants = item.variants.map((v) => ({
        name: v.name,
        price: v.price,
        available: v.available ?? true,
        inventory: v.inventory ?? 50,
        trackInventory: true,
      })) as typeof doc.variants;
      await doc.save();
    }

    await syncPricing(
      doc._id as mongoose.Types.ObjectId,
      item,
      doc.variants?.map((v) => ({
        _id: v._id as mongoose.Types.ObjectId,
        name: v.name,
        price: v.price,
      })),
    );
    upserted += 1;
    const priceLabel = item.variants?.length
      ? `$${item.price.toFixed(2)}+`
      : `$${item.price.toFixed(2)}`;
    console.log(`✓ ${item.name} — ${priceLabel}`);
  }

  // Archive old placeholder drafts so shop shows real catalog
  const catalogSlugs = products.map((p) => p.slug);
  const archived = await Product.updateMany(
    { status: "draft", slug: { $nin: catalogSlugs }, name: /draft/i },
    { $set: { status: "archived" } },
  );

  await ActivityLog.create({
    action: "seed.catalog_products",
    entityType: "Product",
    summary: `Upserted ${upserted} catalog products (batch 1–13)`,
    meta: { slugs: catalogSlugs, archivedDrafts: archived.modifiedCount },
  });

  console.log(`\nDone. Upserted ${upserted} products.`);
  console.log(`Archived ${archived.modifiedCount} old draft placeholders.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
