import { MARQUEE_ITEMS } from "@/lib/constants";

export function CategoryMarquee({
  items = MARQUEE_ITEMS,
}: {
  items?: readonly string[];
}) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-[#e8e4ea]/70 bg-[#f3eef3]/65 py-4">
      <div className="marquee-track gap-10 px-4">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.22em] text-charcoal/70"
          >
            <span className="mr-10 text-muted-mauve">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
