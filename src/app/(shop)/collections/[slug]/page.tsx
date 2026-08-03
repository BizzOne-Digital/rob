import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CREATION_CATEGORIES,
  GIFT_OCCASIONS,
  PLACEHOLDER_IMAGES,
} from "@/lib/constants";
import { getPublishedProducts, serialize } from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { Container } from "@/components/ui/Container";
import { CtaBanner } from "@/components/shared/CtaBanner";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const occasion = GIFT_OCCASIONS.find((g) => g.slug === slug);
  const category = CREATION_CATEGORIES.find((c) => c.slug === slug);
  const name = occasion?.name || category?.name;
  if (!name) return { title: "Collection" };
  return {
    title: name,
    description: `Explore the ${name} collection from RW Designs Canada.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const occasion = GIFT_OCCASIONS.find((g) => g.slug === slug);
  const category = CREATION_CATEGORIES.find((c) => c.slug === slug);
  if (!occasion && !category) notFound();

  const name = occasion?.name || category!.name;
  const result = await getPublishedProducts(
    occasion
      ? { giftOccasion: occasion.name, limit: 24 }
      : { categorySlug: category!.slug, limit: 24 },
  );
  const products = serialize(result.items);

  return (
    <>
      <PageHero
        eyebrow="Collection"
        title={name}
        description={
          occasion
            ? `Thoughtful handmade gifts inspired by ${name.toLowerCase()}.`
            : category!.summary
        }
        image={PLACEHOLDER_IMAGES.gift}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Collections" },
          { label: name },
        ]}
      />
      <Container className="py-14">
        <ProductGrid products={products as never} />
      </Container>
      <Container className="pb-12">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gift" },
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candle" },
            { src: PLACEHOLDER_IMAGES.home, alt: "Home" },
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.engraved, alt: "Keepsake" },
          ]}
        />
      </Container>
      <CtaBanner
        title="Need help choosing?"
        description="We’re happy to suggest pieces for your occasion."
        primaryLabel="Contact us"
        primaryHref="/contact"
        secondaryLabel="Shop all"
        secondaryHref="/what-we-create"
      />
    </>
  );
}
