import type { Metadata } from "next";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { getPublishedFaqs, serialize } from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { FaqBrowser } from "@/components/faq/FaqBrowser";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about products, custom orders, personalization, shipping, pickup, and care from RW Designs Canada.",
};

export default async function FaqPage() {
  const faqs = serialize(await getPublishedFaqs());

  return (
    <>
      <FaqJsonLd faqs={faqs} />
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions"
        description="Search by topic or keyword — from custom orders to candle care."
        image={PLACEHOLDER_IMAGES.sparkle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ" },
        ]}
      />
      <Container className="py-14">
        {faqs.length === 0 ? (
          <EmptyState
            title="FAQs coming soon"
            description="We’re preparing helpful answers for common questions."
            actionLabel="Contact us"
            actionHref="/contact"
          />
        ) : (
          <FaqBrowser faqs={faqs as never} />
        )}
      </Container>
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candle care" },
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gifting" },
            { src: PLACEHOLDER_IMAGES.workspace, alt: "Studio" },
            { src: PLACEHOLDER_IMAGES.process, alt: "Process" },
          ]}
        />
      </Container>
    </>
  );
}
