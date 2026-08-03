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
  align = "split",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
  /** `split` = text + image; `center` = text only, centered */
  align?: "split" | "center";
}) {
  const centered = align === "center" || !image;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-soft-beige/70 bg-gradient-to-br from-icy-blue via-warm-ivory to-powder-blue grain-panel",
        className,
      )}
    >
      <Container
        className={cn(
          "relative z-10 py-14 md:py-20 lg:py-22",
          centered
            ? "flex flex-col items-center text-center"
            : "grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] lg:py-24",
        )}
      >
        <div
          className={cn(
            centered
              ? "flex w-full max-w-3xl flex-col items-center"
              : "self-start md:self-center md:pt-2",
          )}
        >
          {breadcrumbs?.length ? (
            <nav
              className={cn(
                "mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-charcoal/50",
                centered && "justify-center",
              )}
            >
              {breadcrumbs.map((crumb, i) => (
                <span
                  key={`${crumb.label}-${i}`}
                  className="flex items-center gap-2"
                >
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
          <h1
            className={cn(
              "font-serif text-[1.85rem] leading-[1.12] text-charcoal sm:text-4xl md:text-5xl lg:text-6xl",
              centered ? "max-w-3xl" : "max-w-2xl",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                "mt-4 text-[15px] leading-relaxed text-charcoal/65 sm:mt-5 sm:text-base md:text-lg",
                centered ? "max-w-2xl" : "max-w-xl",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {!centered && image ? (
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
        ) : null}
      </Container>
    </section>
  );
}
