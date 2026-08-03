import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "mauve",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "mauve" | "blue" | "ivory" | "charcoal";
}) {
  const tones = {
    mauve: "bg-dusty-lavender/40 text-charcoal",
    blue: "bg-powder-blue text-charcoal",
    ivory: "bg-soft-beige text-charcoal/80",
    charcoal: "bg-charcoal text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
