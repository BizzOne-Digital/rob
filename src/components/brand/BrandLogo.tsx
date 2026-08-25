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
    rw: "text-[1.4rem] leading-[0.82]",
    designs: "text-[0.49rem] leading-none tracking-[0.12em] -mt-1",
    canada: "text-[0.47rem] leading-none tracking-[0.02em] mt-px",
  },
  md: {
    rw: "text-[1.5rem] leading-[0.82] sm:text-[1.6rem] lg:text-[1.75rem]",
    designs:
      "text-[0.52rem] leading-none tracking-[0.12em] -mt-1.5 sm:text-[0.54rem] lg:text-[0.56rem]",
    canada:
      "text-[0.47rem] leading-none tracking-[0.02em] mt-0.5 sm:text-[0.49rem] lg:text-[0.52rem]",
  },
  lg: {
    rw: "text-[2.7rem] leading-[0.82] sm:text-[3.1rem]",
    designs:
      "text-[0.65rem] leading-none tracking-[0.14em] -mt-2.5 sm:text-[0.72rem]",
    canada: "text-[0.56rem] leading-none tracking-[0.02em] mt-0.5 sm:text-[0.6rem]",
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
