/**
 * Sync shipping policy copy (11 lbs, not $11) in SiteSettings, Page, and FAQ.
 * Run: npx tsx scripts/update-shipping-copy.ts
 */
import { config } from "dotenv";
import path from "path";
import {
  SHIPPING_FAQ_ANSWER,
  SHIPPING_POLICY_SUMMARY,
} from "../src/lib/shipping";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const FLAT_RATE_NOTE =
  "Canada only. $10 flat rate for orders up to 11 lbs. Higher rates apply above 11 lbs (pricing to be confirmed).";

const SHIPPING_PAGE_BODY = `${SHIPPING_POLICY_SUMMARY}

Local pickup may be available in select areas. Production and dispatch timelines vary. Non-personalized items may be eligible for return discussion within a limited window; personalized and custom orders are generally final sale except for quality concerns. Email rwdesignscanada@gmail.com for help.`;

const SETTINGS_SHIPPING_RETURNS = `${SHIPPING_POLICY_SUMMARY}

Local pickup may be available in select areas. Production and dispatch timelines vary by item. Returns for unused, non-personalized items may be considered within a limited window; personalized and custom pieces are typically final sale unless there is a quality issue. Contact us to discuss any concern.`;

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { SiteSettings } = await import("../src/models/SiteSettings");
  const { Page } = await import("../src/models/Page");
  const { FAQ } = await import("../src/models/FAQ");

  await connectDB();

  const settings = await SiteSettings.findOneAndUpdate(
    {},
    {
      $set: {
        "shipping.flatRate.note": FLAT_RATE_NOTE,
        "policies.shippingReturns": SETTINGS_SHIPPING_RETURNS,
      },
    },
    { returnDocument: "after" },
  );
  console.log(
    settings
      ? "Updated SiteSettings shipping copy."
      : "No SiteSettings document found.",
  );

  const page = await Page.findOneAndUpdate(
    { slug: "shipping-and-returns" },
    {
      $set: {
        "sections.$[body].body": SHIPPING_PAGE_BODY,
      },
    },
    {
      arrayFilters: [{ "body.key": "body" }],
      returnDocument: "after",
    },
  );
  console.log(
    page
      ? "Updated shipping-and-returns page body."
      : "No shipping-and-returns page found.",
  );

  const faq = await FAQ.findOneAndUpdate(
    { question: "Do you ship across Canada?" },
    { $set: { answer: SHIPPING_FAQ_ANSWER } },
    { returnDocument: "after" },
  );
  console.log(
    faq ? "Updated FAQ shipping answer." : "No matching FAQ entry found.",
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
