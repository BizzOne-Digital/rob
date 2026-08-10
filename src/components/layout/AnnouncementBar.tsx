import Link from "next/link";
import { Heart } from "lucide-react";

export function AnnouncementBar({
  text,
  link,
  enabled = true,
}: {
  text?: string | null;
  link?: string | null;
  enabled?: boolean | null;
}) {
  if (!enabled) return null;

  const display =
    text?.trim() || "Thoughtfully handmade in Canada";

  const content = (
    <p className="inline-flex items-center justify-center gap-2 px-1 text-center text-[11px] leading-snug tracking-[0.02em] text-[#5a5148] sm:text-[13px] sm:leading-none">
      <Heart className="h-3.5 w-3.5 shrink-0 text-taupe" strokeWidth={1.75} fill="currentColor" />
      <span>{display}</span>
    </p>
  );

  return (
    <div className="overflow-x-clip border-b border-[#e8e0d6]/80 bg-[#f7f3ee]">
      <div className="mx-auto flex max-w-[1280px] justify-center px-3 py-2.5 sm:px-6 sm:py-[11px] lg:px-8">
        {link ? (
          <Link href={link} className="block transition hover:opacity-80">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
