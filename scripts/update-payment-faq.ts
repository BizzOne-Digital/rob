/**
 * Update payment FAQ to mention Square instead of Stripe.
 * Run: npx tsx scripts/update-payment-faq.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const PAYMENT_FAQ_ANSWER =
  "When online checkout is enabled, secure card payments are processed through Square. We’ll confirm available methods at purchase time.";

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { FAQ } = await import("../src/models/FAQ");

  await connectDB();

  const faq = await FAQ.findOneAndUpdate(
    { question: "What payment methods do you accept?" },
    { $set: { answer: PAYMENT_FAQ_ANSWER } },
    { returnDocument: "after" },
  );

  console.log(faq ? "Updated payment FAQ." : "No matching FAQ entry found.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
