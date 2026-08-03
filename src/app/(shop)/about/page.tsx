import type { Metadata } from "next";
import { ABOUT_CONTENT, PLACEHOLDER_IMAGES } from "@/lib/constants";
import { PageHero } from "@/components/shared/PageHero";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { CtaBanner } from "@/components/shared/CtaBanner";
import { Container } from "@/components/ui/Container";
import { MotionSection } from "@/components/shared/MotionSection";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "About",
  description:
    "At RW Designs Canada, every piece is thoughtfully handcrafted with a focus on quality, timeless design, and lasting beauty.",
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      <PageHero
        eyebrow="Our studio"
        title={ABOUT_CONTENT.title}
        description={ABOUT_CONTENT.paragraphs[0]}
        image="/images/brand/hero-lifestyle.png"
        imageAlt="Handmade creations by RW Designs Canada"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
      />

      <MotionSection className="py-16 md:py-24">
        <Container className="max-w-3xl">
          {ABOUT_CONTENT.paragraphs.slice(1).map((p) => (
            <p key={p} className="mb-6 text-lg leading-relaxed text-charcoal/70">
              {p}
            </p>
          ))}
        </Container>
      </MotionSection>

      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.hands, alt: "Hands crafting" },
            { src: PLACEHOLDER_IMAGES.candle, alt: "Hand-poured candle" },
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Thoughtful packaging" },
            { src: PLACEHOLDER_IMAGES.home, alt: "Piece in a home setting" },
            { src: PLACEHOLDER_IMAGES.process, alt: "Studio process" },
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gift-ready creation" },
          ]}
        />
      </Container>

      <ProcessSteps />
      <CtaBanner
        title="Explore what we create"
        description="Browse collections or reach out for a custom piece made just for you."
        primaryLabel="What We Create"
        primaryHref="/what-we-create"
        secondaryLabel="Contact"
        secondaryHref="/contact"
      />
    </>
  );
}
