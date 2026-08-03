import Image from "next/image";
import Link from "next/link";
import { Gift, HeartHandshake } from "lucide-react";
import { BRAND } from "@/lib/constants";

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 22v-7" />
      <path d="M12 15c-3-1-5-3.5-5-7 3 0 5 2 5 5" />
      <path d="M12 15c3-1 5-3.5 5-7-3 0-5 2-5 5" />
    </svg>
  );
}

export function Hero({ headline }: { headline?: string | null }) {
  const title = headline || BRAND.headline;

  return (
    <section className="relative isolate overflow-hidden bg-[#e8eef4]">
      <div className="absolute inset-0">
        <Image
          src="/images/brand/hero-lifestyle.png"
          alt="Handmade candles, wax melts, keychains, and engraved gifts by RW Designs Canada"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#e8eef4] via-[#e8eef4]/90 to-transparent lg:via-[#e8eef4]/50" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1200px] items-center px-5 py-16 sm:px-8 lg:min-h-[620px] lg:px-10 lg:py-20">
        <div className="w-full max-w-[540px]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7f92]">
            Handmade | Personalized | Canada
          </p>

          <h1 className="font-serif text-[2.6rem] font-medium leading-[1.12] tracking-[-0.02em] text-[#2f2c31] sm:text-[3.2rem] lg:text-[3.5rem]">
            Beautifully handmade.
            <br />
            Thoughtfully designed.
          </h1>

          <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-[#5c5660]">
            Discover hand-poured home fragrance, personalized gifts, beaded
            accessories, laser-engraved pieces, and custom creations made with
            care.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#b08d9e] px-6 text-[13px] font-semibold text-white transition hover:bg-[#9f7d8e]"
            >
              Shop the collection
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#b08d9e]/80 bg-white/70 px-6 text-[13px] font-semibold text-[#9a7f92] transition hover:bg-white"
            >
              View All Items
            </Link>
          </div>

          <ul className="mt-10 flex flex-nowrap items-center gap-5 overflow-x-auto pb-1 sm:gap-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TrustItem
              icon={<HeartHandshake className="h-4 w-4" strokeWidth={1.7} />}
              label="Handcrafted with Care"
            />
            <TrustItem
              icon={<Gift className="h-4 w-4" strokeWidth={1.7} />}
              label="Personalized Gifts"
            />
            <TrustItem
              icon={<SproutIcon className="h-4 w-4" />}
              label="Locally Made Canada"
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[12px] font-medium text-[#6B5B5B] sm:text-[13px]">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#6B5B5B] shadow-sm">
        {icon}
      </span>
      {label}
    </li>
  );
}
