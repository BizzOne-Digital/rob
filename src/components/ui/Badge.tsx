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
    mauve: "bg-[#b08d9e] text-white",
    blue: "bg-[#dce8f7] text-[#2f2c31]",
    ivory: "bg-[#ede6dd] text-[#2f2c31]",
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
