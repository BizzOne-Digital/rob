import type { Metadata } from "next";
import { getGalleryItems, serialize } from "@/lib/data";
import { BRAND } from "@/lib/constants";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { MotionSection } from "@/components/shared/MotionSection";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Browse handmade creations and studio moments from ${BRAND.name}.`,
};

export default async function GalleryPage() {
  const items = serialize(await getGalleryItems());

  return (
    <>
      <PageHero
        align="center"
        eyebrow="Gallery"
        title="A glimpse into the details"
        description="Handcrafted pieces, finished work, and moments from the studio."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery" },
        ]}
      />

      <Container className="py-10 sm:py-14 lg:py-16">
        {items.length === 0 ? (
          <p className="text-center text-charcoal/60">
            New gallery photos are on the way — check back soon.
          </p>
        ) : (
          <MotionSection
            as="div"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4"
          >
            {items.map((item) => (
              <figure
                key={String(item._id)}
                className="group overflow-hidden rounded-lg bg-[#f0ebe7]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={item.image?.url}
                    alt={item.image?.alt || item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                {(item.title || item.caption) && (
                  <figcaption className="space-y-0.5 px-3 py-2.5">
                    {item.title ? (
                      <p className="font-serif text-sm text-charcoal">{item.title}</p>
                    ) : null}
                    {item.caption ? (
                      <p className="text-xs leading-relaxed text-charcoal/60">
                        {item.caption}
                      </p>
                    ) : null}
                  </figcaption>
                )}
              </figure>
            ))}
          </MotionSection>
        )}
      </Container>
    </>
  );
}
