import Image from "next/image";
import Link from "next/link";
import { Gift, HeartHandshake } from "lucide-react";
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

export function Hero({ headline }: { headline?: string | null } = {}) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#efe6da]"
      data-headline={headline || undefined}
    >
      <div className="absolute inset-0">
        <Image
          src="/images/brand/hero-lifestyle.png"
          alt="Handmade candles, wax melts, keychains, and engraved gifts by RW Designs Canada"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f1e9] via-[#f7f1e9]/92 to-transparent lg:via-[#f7f1e9]/55" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[480px] w-full max-w-[1200px] items-center px-4 py-12 sm:min-h-[560px] sm:px-8 sm:py-16 lg:min-h-[620px] lg:px-10 lg:py-20">
        <div className="w-full min-w-0 max-w-[540px]">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a876e] sm:mb-4 sm:text-[11px] sm:tracking-[0.2em]">
            Handmade | Personalized | Canada
          </p>

          <h1 className="font-serif text-[2rem] font-medium leading-[1.12] tracking-[-0.02em] text-[#2a2420] sm:text-[3.2rem] lg:text-[3.5rem]">
            Beautifully handmade.
            <br />
            Thoughtfully designed.
          </h1>

          <p className="mt-4 max-w-[460px] text-[14px] leading-relaxed text-[#4a4038] sm:mt-5 sm:text-[15px]">
            Discover handcrafted, all-natural soy wax candles, car air
            fresheners, personalized gifts, custom laser-engraved creations,
            beaded keychains and accessories—made with quality, creativity, and
            care.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <Link
              href="/what-we-create"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#b1a18a] px-5 text-[13px] font-semibold text-white transition hover:bg-[#7f6e57] sm:flex-none sm:px-6"
            >
              Shop the collection
            </Link>
            <Link
              href="/what-we-create"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-[#b1a18a] bg-white/80 px-5 text-[13px] font-semibold text-[#7f6e57] transition hover:bg-white sm:flex-none sm:px-6"
            >
              View All Items
            </Link>
          </div>

          <ul className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-3">
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
    <li className="inline-flex items-center gap-2 text-[12px] font-medium text-[#6B5B5B] sm:text-[13px]">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#6B5B5B] shadow-sm">
        {icon}
      </span>
      {label}
    </li>
  );
}
