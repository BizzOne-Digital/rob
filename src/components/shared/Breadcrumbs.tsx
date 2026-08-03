import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-charcoal/50",
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden>/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition hover:text-muted-mauve">
              {item.label}
            </Link>
          ) : (
            <span className="text-charcoal/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
