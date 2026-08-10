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
    designs: "text-[0.58rem] tracking-[0.32em]",
    canada: "text-[0.48rem] tracking-[0.28em]",
    gap: "gap-1",
  },
  md: {
    rw: "text-[2.15rem] leading-none sm:text-[2.35rem]",
    designs: "text-[0.62rem] tracking-[0.34em] sm:text-[0.68rem]",
    canada: "text-[0.5rem] tracking-[0.3em] sm:text-[0.52rem]",
    gap: "gap-1.5",
  },
  lg: {
    rw: "text-[2.75rem] leading-none sm:text-[3.25rem]",
    designs: "text-[0.72rem] tracking-[0.36em] sm:text-[0.8rem]",
    canada: "text-[0.55rem] tracking-[0.32em] sm:text-[0.6rem]",
    gap: "gap-2",
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
        "inline-flex flex-col items-center text-center",
        s.gap,
        ink,
        className,
      )}
      aria-label={BRAND.name}
    >
      <span className={cn("font-serif font-medium", s.rw)}>RW</span>
      <span
        className={cn(
          "font-sans font-medium uppercase",
          s.designs,
          muted,
        )}
      >
        Designs
      </span>
      <span
        className={cn(
          "flex w-full max-w-[7.5rem] items-center gap-2 font-sans font-medium uppercase",
          s.canada,
          muted,
        )}
      >
        <span className={cn("h-px flex-1", rule)} aria-hidden />
        Canada
        <span className={cn("h-px flex-1", rule)} aria-hidden />
      </span>
    </span>
  );

  if (href === false) return mark;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex shrink-0 focus-visible:outline-none"
    >
      {mark}
    </Link>
  );
}
