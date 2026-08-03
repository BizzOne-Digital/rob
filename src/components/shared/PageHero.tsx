import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  breadcrumbs,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-soft-beige/70 bg-gradient-to-br from-icy-blue via-warm-ivory to-powder-blue grain-panel",
        className,
      )}
    >
      <Container className="relative z-10 grid items-center gap-10 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20 lg:py-24">
        <div className="self-start md:self-center md:pt-2">
          {breadcrumbs?.length ? (
            <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-charcoal/50">
              {breadcrumbs.map((crumb, i) => (
                <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 ? <span>/</span> : null}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-muted-mauve">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-charcoal/70">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : null}
          {eyebrow ? (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-mauve">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-2xl font-serif text-4xl leading-[1.1] text-charcoal sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal/65 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-powder-blue/40 md:aspect-[5/6] md:max-h-[520px]">
          <ImageWithFallback
            src={image}
            alt={imageAlt ?? title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </Container>
    </section>
  );
}
