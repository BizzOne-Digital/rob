import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-lg flex-col items-center rounded-[1.75rem] border border-dashed border-dusty-lavender/50 bg-white/50 px-8 py-14 text-center",
        className,
      )}
    >
      <p className="font-script text-3xl text-muted-mauve">RW</p>
      <h3 className="mt-3 font-serif text-2xl text-charcoal">{title}</h3>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-charcoal/60">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Button href={actionHref} className="mt-6" variant="soft">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
