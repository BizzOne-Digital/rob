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
    mauve: "bg-taupe text-white",
    blue: "bg-sage-soft text-[#2f2a26]",
    ivory: "bg-soft-beige text-[#2f2a26]",
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
