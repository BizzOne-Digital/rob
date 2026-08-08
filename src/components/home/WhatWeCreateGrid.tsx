import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

type Category = {
  _id?: string;
  name: string;
  slug: string;
  summary?: string;
  heroImage?: { url?: string; alt?: string } | null;
  images?: Array<{ url?: string; alt?: string } | null>;
};

const fallbackBySlug: Record<string, string> = {
  freshies: PLACEHOLDER_IMAGES.freshie,
  "wax-melts-and-candles": PLACEHOLDER_IMAGES.waxMelts,
  "beaded-keychains": PLACEHOLDER_IMAGES.keychain,
  "laser-engraved-items": PLACEHOLDER_IMAGES.engraved,
  "wood-signs": PLACEHOLDER_IMAGES.woodSign,
  "custom-creations": PLACEHOLDER_IMAGES.gift,
};

export function WhatWeCreateGrid({
  categories,
}: {
  categories: Category[];
}) {
  const list = categories.slice(0, 5);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a876e]">
              Explore
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#2f2c31] sm:text-4xl">
              What We Create
            </h2>
          </div>
          <Link
            href="/what-we-create"
            className="hidden text-[13px] font-semibold text-[#9a876e] underline-offset-4 hover:underline sm:inline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {list.map((cat) => {
            const src =
              cat.heroImage?.url ||
              cat.images?.[0]?.url ||
              fallbackBySlug[cat.slug] ||
              PLACEHOLDER_IMAGES.gallery1;
            return (
              <Link
                key={cat.slug}
                href={`/what-we-create?category=${cat.slug}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-[#eef2f7]"
              >
                <Image
                  src={src}
                  alt={cat.heroImage?.alt || cat.name}
                  fill
                  sizes="(max-width:768px) 50vw, 20vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                  <p className="font-serif text-[15px] text-white sm:text-base">
                    {cat.name}
                  </p>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#6B5B5B] transition group-hover:bg-[#b1a18a] group-hover:text-white">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
