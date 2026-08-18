import Link from "next/link";
import {
  Flame,
  KeyRound,
  PencilRuler,
  Sparkles,
  Trees,
  Wind,
} from "lucide-react";

const items = [
  {
    label: "Freshies",
    href: "/what-we-create?category=freshies",
    icon: Wind,
  },
  {
    label: "Wax Melts & Candles",
    href: "/what-we-create?category=wax-melts-and-candles",
    icon: Flame,
  },
  {
    label: "Keychains & Accessories",
    href: "/what-we-create?category=beaded-keychains",
    icon: KeyRound,
  },
  {
    label: "Laser Engraved",
    href: "/what-we-create?category=laser-engraved-items",
    icon: PencilRuler,
  },
  {
    label: "Wood Signs",
    href: "/what-we-create?category=wood-signs",
    icon: Trees,
  },
  {
    label: "Custom Creations",
    href: "/what-we-create?category=custom-creations",
    icon: Sparkles,
  },
] as const;

export function CategoryStrip() {
  return (
    <section className="overflow-x-clip border-y border-[#e6e2e8] bg-white">
      <div className="mx-auto w-full max-w-[1200px] min-w-0 px-3 py-4 sm:px-8 sm:py-5 lg:px-10">
        <div className="flex w-full min-w-0 items-stretch gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-between sm:gap-2 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex w-[6.25rem] shrink-0 flex-col items-center gap-2 px-1 py-2.5 text-center sm:w-auto sm:min-w-[6.5rem] sm:flex-1 sm:px-2"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8a7585] transition group-hover:bg-[#f6f1f6] group-hover:text-[#a68d7b] sm:h-10 sm:w-10">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="text-[11px] font-medium leading-snug text-[#5c5660] sm:text-[12px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
