import type { Metadata } from "next";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { PageHero } from "@/components/shared/PageHero";
import { WhatWeCreateGrid } from "@/components/home/WhatWeCreateGrid";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { CtaBanner } from "@/components/shared/CtaBanner";
import { Container } from "@/components/ui/Container";
import { getPublishedCategories, serialize } from "@/lib/data";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "What We Create",
  description:
    "Explore handmade freshies, wax melts & candles, beaded keychains, laser-engraved items, wood signs, and custom creations.",
};

export default async function WhatWeCreatePage() {
  const categories = serialize(await getPublishedCategories());

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "What We Create", path: "/what-we-create" },
        ]}
      />
      <PageHero
        eyebrow="Collections"
        title="What We Create"
        description="Six handmade collections designed for gifting, home fragrance, and personal keepsakes."
        image={PLACEHOLDER_IMAGES.hero}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "What We Create" },
        ]}
      />
      <WhatWeCreateGrid categories={categories} />
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.freshie, alt: "Freshies" },
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candles" },
            { src: PLACEHOLDER_IMAGES.keychain, alt: "Beaded keychains" },
            { src: PLACEHOLDER_IMAGES.engraved, alt: "Laser-engraved items" },
            { src: PLACEHOLDER_IMAGES.woodSign, alt: "Wood signs" },
            { src: PLACEHOLDER_IMAGES.gift, alt: "Custom creations" },
          ]}
        />
      </Container>
      <CtaBanner
        title="Looking for something unique?"
        description="Tell us about your idea — we’ll help shape a custom handmade piece."
        primaryLabel="Custom creations"
        primaryHref="/what-we-create/custom-creations"
        secondaryLabel="Shop all"
        secondaryHref="/shop"
      />
    </>
  );
}
