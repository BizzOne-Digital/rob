import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export function CtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}: {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f7f3ee] via-[#efe8df] to-[#eef1ea]/75 px-8 py-14 text-center grain-panel md:px-16 md:py-20">
          <p className="font-script text-3xl text-muted-mauve md:text-4xl">Handmade with care</p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal md:text-5xl">{title}</h2>
          {description ? (
            <p className="mx-auto mt-4 max-w-2xl text-base text-charcoal/65">{description}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href={primaryHref} variant="secondary" className="!text-white">
              {primaryLabel}
            </Button>
            {secondaryLabel && secondaryHref ? (
              <Button href={secondaryHref} variant="outline">
                {secondaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
