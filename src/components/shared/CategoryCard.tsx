import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/utils";

export function CategoryCard({
  name,
  summary,
  href,
  image,
  className,
}: {
  name: string;
  summary: string;
  href: string;
  image?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-[1.5rem] bg-white/70 shadow-[var(--shadow-soft)] transition duration-500 hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-powder-blue/40">
        <ImageWithFallback
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-2xl text-charcoal">{name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal/60">
          {summary}
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-mauve">
          Explore
        </p>
      </div>
    </Link>
  );
}
