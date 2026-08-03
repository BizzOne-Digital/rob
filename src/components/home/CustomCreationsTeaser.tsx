import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

export function CustomCreationsTeaser() {
  return (
    <section className="bg-[#b08d9e]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-14">
        <div className="text-white">
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            Made Especially for You
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
            Looking for something personal? Explore custom wording, colours,
            and one-of-a-kind creations designed with your moment in mind.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-[13px] font-semibold !text-[#9a7f92] transition hover:bg-[#f7f2f6] hover:!text-[#7d6574]"
          >
            Shop All Collections
          </Link>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white/20">
          <Image
            src={PLACEHOLDER_IMAGES.gift}
            alt="Personalized handmade gifts by RW Designs Canada"
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
