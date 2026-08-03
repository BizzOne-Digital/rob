/**
 * Seed approved customer reviews for homepage slider.
 * Run: $env:MONGODB_URI="mongodb://127.0.0.1:27017/rw-designs-canada"; npx tsx scripts/seed-testimonials.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/rw-designs-canada";
}

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Testimonial } from "../src/models/Testimonial";

const reviews = [
  {
    customerName: "Jenn",
    reviewText: "Lovely refreshing scent for the spring",
    reviewDate: "22 May, 2026",
    rating: 5,
    featured: true,
    approved: true,
    displayOrder: 1,
  },
  {
    customerName: "Etsy buyer",
    reviewText:
      "Great quality and a good Father’s Day gift. Owner gave excellent customer service when I had a small issue. They went above and beyond to ensure satisfaction.",
    reviewDate: "28 May, 2024",
    rating: 5,
    featured: true,
    approved: true,
    displayOrder: 2,
  },
  {
    customerName: "Victoria",
    reviewText:
      "The items were beautiful and as described. I needed 2 keychains the same and they look identical. Great quality",
    reviewDate: "05 Apr, 2024",
    rating: 5,
    featured: true,
    approved: true,
    displayOrder: 3,
  },
  {
    customerName: "Etsy buyer",
    reviewText:
      "Love the fall blocks. Wonderfully made. Love the colors. Thank you!",
    reviewDate: "14 Oct, 2022",
    rating: 5,
    featured: true,
    approved: true,
    displayOrder: 4,
  },
];

async function main() {
  await connectDB();

  // Replace previous placeholder/unapproved samples with these approved reviews
  await Testimonial.deleteMany({});

  await Testimonial.insertMany(reviews);

  console.log(`Seeded ${reviews.length} approved testimonials`);
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
