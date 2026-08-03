import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/ui/Container";
import { MotionSection } from "./MotionSection";

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  description,
  eyebrow = "FAQ",
}: {
  faqs: Array<{ _id?: string; id?: string; question: string; answer: string }>;
  title?: string;
  description?: string;
  eyebrow?: string;
}) {
  if (!faqs.length) {
    return (
      <Container className="py-16">
        <EmptyState
          title="FAQs coming soon"
          description="We’re gathering thoughtful answers to the questions we hear most often."
        />
      </Container>
    );
  }

  return (
    <MotionSection className="py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion
            items={faqs.map((faq, i) => ({
              id: String(faq._id ?? faq.id ?? i),
              question: faq.question,
              answer: faq.answer,
            }))}
          />
        </div>
      </Container>
    </MotionSection>
  );
}
