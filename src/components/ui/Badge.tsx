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
    mauve: "bg-[#b1a18a] text-white",
    blue: "bg-[#c5beac] text-[#2a2420]",
    ivory: "bg-[#e6d9c8] text-[#2a2420]",
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
