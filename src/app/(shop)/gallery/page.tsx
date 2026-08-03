import type { Metadata } from "next";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { getGalleryItems, serialize } from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { GalleryMasonry } from "@/components/gallery/GalleryMasonry";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageGrid } from "@/components/shared/ImageGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual look at handmade pieces, finishes, and studio moments from RW Designs Canada.",
};

export default async function GalleryPage() {
  const items = serialize(await getGalleryItems());
  const display =
    items.length > 0
      ? items
      : [
          PLACEHOLDER_IMAGES.gallery1,
          PLACEHOLDER_IMAGES.gallery2,
          PLACEHOLDER_IMAGES.gallery3,
          PLACEHOLDER_IMAGES.gallery4,
          PLACEHOLDER_IMAGES.gallery5,
          PLACEHOLDER_IMAGES.workspace,
        ].map((src, i) => ({
          _id: `placeholder-${i}`,
          title: "Studio moment",
          caption: null,
          image: { url: src, alt: "Gallery placeholder" },
        }));

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Made by hand, captured with care"
        description="Textures, colours, and finished creations from our Canadian studio."
        image={PLACEHOLDER_IMAGES.gallery1}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery" },
        ]}
      />
      <Container className="py-14">
        {display.length ? (
          <GalleryMasonry items={display as never} />
        ) : (
          <EmptyState title="Gallery coming soon" description="We’re preparing new photos from the studio." />
        )}
      </Container>
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.hands, alt: "Crafting" },
            { src: PLACEHOLDER_IMAGES.process, alt: "Process" },
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.home, alt: "Home styling" },
            { src: PLACEHOLDER_IMAGES.sparkle, alt: "Detail" },
          ]}
        />
      </Container>
    </>
  );
}
