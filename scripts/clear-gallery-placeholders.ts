/**
 * Remove seeded placeholder gallery items from the database.
 * Run: npx tsx scripts/clear-gallery-placeholders.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { GalleryItem } = await import("../src/models/GalleryItem");

  await connectDB();

  const result = await GalleryItem.deleteMany({
    "image.url": { $regex: "^/images/placeholders/" },
  });

  console.log(`Removed ${result.deletedCount} placeholder gallery item(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
