import { cn } from "@/lib/utils";

export function RichContent({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={cn("prose-rw", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
