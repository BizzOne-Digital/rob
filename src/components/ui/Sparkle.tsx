import { cn } from "@/lib/utils";

export function Sparkle({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 rotate-45 bg-muted-mauve animate-sparkle",
        className,
      )}
    />
  );
}
