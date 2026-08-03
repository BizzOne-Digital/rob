import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-powder-blue/50 via-soft-beige/70 to-icy-blue/50",
        className,
      )}
    />
  );
}
