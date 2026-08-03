import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-white hover:bg-charcoal/90 shadow-sm",
  secondary: "bg-muted-mauve text-white hover:bg-muted-mauve/90",
  ghost: "bg-transparent text-charcoal hover:bg-powder-blue/60",
  outline:
    "border border-charcoal/15 bg-transparent text-charcoal hover:border-muted-mauve hover:bg-white/70",
  soft: "bg-powder-blue text-charcoal hover:bg-icy-blue",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs tracking-[0.08em]",
  md: "h-11 px-6 text-sm tracking-[0.06em]",
  lg: "h-13 px-8 text-sm tracking-[0.08em] min-h-12",
};

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
