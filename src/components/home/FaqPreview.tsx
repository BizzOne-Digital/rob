import { FaqSection } from "@/components/shared/FaqSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FaqPreview({
  faqs,
}: {
  faqs: Array<{ _id: string; question: string; answer: string }>;
}) {
  if (!faqs.length) return null;

  return (
    <div>
      <FaqSection
        faqs={faqs.slice(0, 5)}
        title="Questions, answered"
        description="A few of the things we’re asked most often."
      />
      <Container className="-mt-10 mb-16 text-center">
        <Button href="/faq" variant="outline">
          Browse all FAQs
        </Button>
      </Container>
    </div>
  );
}
