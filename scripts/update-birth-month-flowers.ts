/**
 * Sync birth month flower options for engraved keychain (Jan–Dec).
 * Run: npx tsx scripts/update-birth-month-flowers.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const BIRTH_MONTH_FLOWERS = [
  "January - Carnation",
  "January - SnowDrop",
  "February - Violet",
  "February - Primrose",
  "March - Daffodil",
  "Mar - Cherry Blossom",
  "April - Sweet Pea",
  "April - Daisy",
  "May - Lily of Valley",
  "May - Hawthorn",
  "June - Rose",
  "June - Honeysuckle",
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
];

const FULL_DESCRIPTION = `Carry your story wherever you go with this laser engraved wood keychain featuring your birth month flower and a matching birthstone-colored charm. Perfect for adding a personalized touch to your keys, bags, or as a thoughtful gift. With two flower choices per month, you can pick the design that best fits your style and personality.

Personalization is available! Add a name to make your keychain extra special. Please note: Personalized designs may have slightly smaller flower and font sizes to ensure a clean, balanced engraving.`;

async function main() {
  const { default: mongoose } = await import("mongoose");
  const { connectDB } = await import("../src/lib/db");
  const { Product } = await import("../src/models/Product");

  await connectDB();

  const result = await Product.findOneAndUpdate(
    { slug: "engraved-birth-month-flower-keychain" },
    {
      $set: {
        fullDescription: FULL_DESCRIPTION,
        optionDefinitions: [
          { name: "Month and Flower", values: BIRTH_MONTH_FLOWERS },
          {
            name: "Personalization",
            values: ["No thank you", "Yes please"],
          },
        ],
        personalizationFields: [
          {
            id: "month_flower",
            label: "Choose your month and flower",
            type: "select",
            required: true,
            options: BIRTH_MONTH_FLOWERS,
            helpText: "Choose your birth month and flower design",
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
    },
    { new: true },
  );

  if (!result) {
    throw new Error("Product not found: engraved-birth-month-flower-keychain");
  }

  console.log(`Updated ${result.name} — ${BIRTH_MONTH_FLOWERS.length} month/flower options`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
