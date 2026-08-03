import type { Metadata } from "next";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { getApprovedTestimonials, serialize } from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { CtaBanner } from "@/components/shared/CtaBanner";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Approved customer reflections on handmade pieces from RW Designs Canada.",
};

export default async function TestimonialsPage() {
  const testimonials = serialize(await getApprovedTestimonials());

  return (
    <>
      <PageHero
        eyebrow="Kind words"
        title="What customers are saying"
        description="We only share approved testimonials — genuine words from people who gifted or kept our creations."
        image={PLACEHOLDER_IMAGES.home}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Testimonials" },
        ]}
      />
      <Container className="py-14">
        {testimonials.length === 0 ? (
          <EmptyState
            title="Testimonials coming soon"
            description="Approved customer stories will appear here."
            actionLabel="Shop creations"
            actionHref="/shop"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard
                key={String(t._id)}
                name={t.customerName}
                text={t.reviewText}
                productName={t.productName}
              />
            ))}
          </div>
        )}
      </Container>
      <Container className="pb-12">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gift" },
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candle" },
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.freshie, alt: "Freshie" },
            { src: PLACEHOLDER_IMAGES.keychain, alt: "Keychain" },
          ]}
        />
      </Container>
      <CtaBanner
        title="Ready to find your piece?"
        primaryLabel="Visit the shop"
        primaryHref="/shop"
        secondaryLabel="Contact"
        secondaryHref="/contact"
      />
    </>
  );
}
