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
    href: "/what-we-create/freshies",
    icon: Wind,
  },
  {
    label: "Wax Melts & Candles",
    href: "/what-we-create/wax-melts-and-candles",
    icon: Flame,
  },
  {
    label: "Keychains & Accessories",
    href: "/what-we-create/beaded-keychains",
    icon: KeyRound,
  },
  {
    label: "Laser Engraved",
    href: "/what-we-create/laser-engraved-items",
    icon: PencilRuler,
  },
  {
    label: "Wood Signs",
    href: "/what-we-create/wood-signs",
    icon: Trees,
  },
  {
    label: "Custom Creations",
    href: "/what-we-create/custom-creations",
    icon: Sparkles,
  },
] as const;

export function CategoryStrip() {
  return (
    <section className="border-y border-[#e6e2e8] bg-white">
      <div className="mx-auto flex max-w-[1200px] items-stretch justify-between gap-2 overflow-x-auto px-4 py-5 sm:px-8 lg:px-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-w-[110px] flex-1 flex-col items-center gap-2 px-2 py-1 text-center"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8a7585] transition group-hover:bg-[#f6f1f6] group-hover:text-[#b08d9e]">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="text-[11px] font-medium leading-tight text-[#5c5660] sm:text-[12px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
