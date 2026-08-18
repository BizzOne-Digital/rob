import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

type BrandLogoProps = {
  href?: string | false;
  className?: string;
  /** light text for dark footers */
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
};

const sizeStyles = {
  sm: {
    rw: "text-[1.65rem] leading-none",
    designs: "text-[0.5rem] leading-none tracking-[0.16em]",
    canada: "text-[0.48rem] leading-none tracking-[0.04em]",
    gap: "gap-[0.2rem]",
    rule: "w-2.5",
  },
  md: {
    rw: "text-[1.85rem] leading-none sm:text-[2.25rem] lg:text-[2.5rem]",
    designs:
      "text-[0.52rem] leading-none tracking-[0.16em] sm:text-[0.56rem] lg:text-[0.6rem]",
    canada:
      "text-[0.48rem] leading-none tracking-[0.04em] sm:text-[0.5rem] lg:text-[0.54rem]",
    gap: "gap-[0.2rem] sm:gap-[0.22rem]",
    rule: "w-3 sm:w-3.5",
  },
  lg: {
    rw: "text-[2.85rem] leading-none sm:text-[3.2rem]",
    designs: "text-[0.62rem] leading-none tracking-[0.16em] sm:text-[0.68rem]",
    canada: "text-[0.54rem] leading-none tracking-[0.04em] sm:text-[0.58rem]",
    gap: "gap-[0.25rem]",
    rule: "w-4",
  },
};

export function BrandLogo({
  href = "/",
  className,
  tone = "dark",
  size = "md",
  onClick,
}: BrandLogoProps) {
  const s = sizeStyles[size];
  const ink = tone === "light" ? "text-[#f7f3ee]" : "text-[#2f2a26]";
  const muted = tone === "light" ? "text-[#f7f3ee]/80" : "text-[#2f2a26]/75";
  const rule = tone === "light" ? "bg-[#f7f3ee]/55" : "bg-[#2f2a26]/45";

  const mark = (
    <span
      className={cn(
        "inline-grid auto-rows-min justify-items-center text-center",
        s.gap,
        ink,
        className,
      )}
      aria-label={BRAND.name}
    >
      <span className={cn("block font-serif font-medium", s.rw)}>RW</span>
      <span
        className={cn(
          "block font-sans font-medium uppercase",
          s.designs,
          muted,
        )}
      >
        Designs
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-sans font-medium uppercase",
          s.canada,
          muted,
        )}
      >
        <span className={cn("h-px shrink-0", s.rule, rule)} aria-hidden />
        Canada
        <span className={cn("h-px shrink-0", s.rule, rule)} aria-hidden />
      </span>
    </span>
  );

  if (href === false) return mark;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex h-full shrink-0 items-center justify-center focus-visible:outline-none"
    >
      {mark}
    </Link>
  );
}
