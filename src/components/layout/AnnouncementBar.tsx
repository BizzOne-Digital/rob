import Link from "next/link";

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
    text?.trim() ||
    "Thoughtfully handmade in Canada • Custom creations available ✨";

  const content = (
    <p className="px-1 text-center text-[11px] leading-snug tracking-[0.01em] text-[#5c5660] sm:text-[13px] sm:leading-none">
      {display}
    </p>
  );

  return (
    <div className="overflow-x-clip border-b border-[#d7e2ef]/60 bg-[#e8eef6]">
      <div className="mx-auto max-w-[1280px] px-3 py-2.5 sm:px-6 sm:py-[11px] lg:px-8">
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
