import Image from "next/image";
import Link from "next/link";
import { Gift, Heart } from "lucide-react";

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
      className="relative isolate overflow-hidden bg-[#f7f3ee]"
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3ee] via-[#f7f3ee]/92 to-transparent lg:via-[#f7f3ee]/55" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(420px,82dvh)] w-full max-w-[1200px] items-center px-4 py-10 sm:min-h-[560px] sm:px-8 sm:py-16 lg:min-h-[620px] lg:px-10 lg:py-20">
        <div className="w-full min-w-0 max-w-[540px]">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-taupe sm:mb-4 sm:text-[11px] sm:tracking-[0.22em]">
            Handmade • Personalized • Made in Canada
          </p>

          <h1 className="text-balance font-serif text-[1.75rem] font-medium leading-[1.12] tracking-[-0.02em] text-[#2f2a26] sm:text-[3.2rem] lg:text-[3.5rem]">
            Beautifully handmade.
            <br />
            Thoughtfully designed.
          </h1>

          <p className="mt-4 max-w-[460px] text-[14px] leading-relaxed text-[#5a5148] sm:mt-5 sm:text-[15px]">
            Discover handcrafted, all-natural soy wax candles, car air
            fresheners, personalized gifts, custom laser-engraved creations,
            beaded keychains and accessories—made with quality, creativity, and
            care.
          </p>

          <div className="mt-6 sm:mt-8">
            <Link
              href="/what-we-create"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-taupe px-5 text-[13px] font-semibold !text-white transition hover:bg-taupe-deep sm:h-11 sm:w-auto sm:px-6"
            >
              Shop Our Collection
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[#e8e0d6]/90 bg-[#f7f3ee]/95 backdrop-blur-sm">
        <ul className="mx-auto grid max-w-[1200px] gap-4 px-4 py-5 sm:grid-cols-3 sm:gap-6 sm:px-8 sm:py-6 lg:px-10">
          <TrustItem
            icon={<Heart className="h-4 w-4" strokeWidth={1.7} />}
            title="Handmade with Care"
            subtitle="Thoughtfully crafted in Canada"
          />
          <TrustItem
            icon={<Gift className="h-4 w-4" strokeWidth={1.7} />}
            title="Made Just for You"
            subtitle="Personalized & custom creations"
          />
          <TrustItem
            icon={<SproutIcon className="h-4 w-4" />}
            title="Small-Batch Quality"
            subtitle="Made with care, creativity & quality materials"
          />
        </ul>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <li className="flex items-start gap-3 text-[#4a433c] sm:items-center">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9d1c7] bg-white text-[#4a433c]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[#2f2a26]">
          {title}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-[#6b6258]">
          {subtitle}
        </span>
      </span>
    </li>
  );
}
