import { PROCESS_STEPS } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionSection } from "./MotionSection";

export function ProcessSteps({
  steps = PROCESS_STEPS,
  title = "Our handmade process",
  description = "Each piece moves through a careful rhythm of intention, craft, and finishing.",
}: {
  steps?: ReadonlyArray<{ title: string; description: string }>;
  title?: string;
  description?: string;
}) {
  return (
    <MotionSection className="py-20 md:py-28">
      <SectionHeading title={title} description={description} eyebrow="How we create" />
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-3 sm:px-8">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-[1.5rem] border border-soft-beige/80 bg-white/70 p-6 shadow-[var(--shadow-soft)]"
          >
            <p className="font-script text-3xl text-muted-mauve">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-serif text-2xl text-charcoal">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/65">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}
