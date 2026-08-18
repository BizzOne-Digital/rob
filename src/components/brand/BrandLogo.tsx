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
    rw: "text-[1.25rem] leading-none",
    designs: "text-[0.44rem] leading-none tracking-[0.12em]",
    canada: "text-[0.42rem] leading-none tracking-[0.02em]",
    gap: "gap-[0.15rem]",
  },
  md: {
    rw: "text-[1.35rem] leading-none sm:text-[1.45rem] lg:text-[1.55rem]",
    designs:
      "text-[0.46rem] leading-none tracking-[0.12em] sm:text-[0.48rem] lg:text-[0.5rem]",
    canada:
      "text-[0.42rem] leading-none tracking-[0.02em] sm:text-[0.44rem] lg:text-[0.46rem]",
    gap: "gap-[0.15rem] sm:gap-[0.18rem]",
  },
  lg: {
    rw: "text-[2.4rem] leading-none sm:text-[2.75rem]",
    designs: "text-[0.58rem] leading-none tracking-[0.14em] sm:text-[0.64rem]",
    canada: "text-[0.5rem] leading-none tracking-[0.02em] sm:text-[0.54rem]",
    gap: "gap-[0.2rem]",
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
      <span className={cn("block font-serif font-medium", s.rw)}>RW</span>
      <span
        className={cn("block font-sans font-medium", s.designs, muted)}
      >
        Designs
      </span>
      <span className={cn("block font-sans font-medium", s.canada, muted)}>
        Canada
      </span>
    </span>
  );

  if (href === false) return mark;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex shrink-0 items-center justify-center focus-visible:outline-none"
    >
      {mark}
    </Link>
  );
}
