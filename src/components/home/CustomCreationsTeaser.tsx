import Image from "next/image";
import Link from "next/link";

export function CustomCreationsTeaser() {
  return (
    <section className="overflow-x-clip bg-[#b08d9e]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-14">
        <div className="min-w-0 text-white">
          <h2 className="font-serif text-[1.85rem] leading-tight sm:text-3xl lg:text-4xl">
            Made Especially for You
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
            Looking for something personal? Explore custom wording, colours,
            and one-of-a-kind creations designed with your moment in mind.
          </p>
          <Link
            href="/what-we-create"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-[13px] font-semibold !text-[#9f7d8e] transition hover:bg-[#faf8f4] hover:!text-[#2f2c31]"
          >
            Shop All Collections
          </Link>
        </div>
        <div className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-2xl bg-[#ede6dd]">
          <Image
            src="/images/brand/home-1.png"
            alt="Personalized handmade gifts by RW Designs Canada"
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            quality={90}
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
