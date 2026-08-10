import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { MotionSection } from "@/components/shared/MotionSection";

export function TestimonialsPreview({
  testimonials,
}: {
  testimonials: Array<{
    _id: string;
    customerName: string;
    reviewText: string;
    productName?: string | null;
  }>;
}) {
  if (!testimonials.length) return null;

  return (
    <MotionSection className="bg-gradient-to-b from-transparent via-[#e8e0d6]/45 to-transparent py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Kind words"
          title="Loved by those who gift and keep"
          description="Thoughts from customers who chose handmade."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard
              key={t._id}
              name={t.customerName}
              text={t.reviewText}
              productName={t.productName}
            />
          ))}
        </div>
      </Container>
    </MotionSection>
  );
}
