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
    <p className="text-center text-[13px] leading-none tracking-[0.01em] text-[#5c5660]">
      {display}
    </p>
  );

  return (
    <div className="border-b border-[#d7e2ef]/60 bg-[#e8eef6]">
      <div className="mx-auto max-w-[1280px] px-4 py-[11px] sm:px-6 lg:px-8">
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
