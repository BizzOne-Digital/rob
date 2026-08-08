import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Sparkle, Gem } from "lucide-react";
import {
  ABOUT_CONTENT,
} from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "At RW Designs Canada, every piece is thoughtfully handcrafted with a focus on quality, timeless design, and lasting beauty.",
};

const principles = [
  {
    title: "Thoughtful Design",
    description:
      "Every piece begins with intention — colour, scent, wording, and the feeling it should create.",
    icon: Sparkle,
    image: "/images/brand/about-core-1.png",
  },
  {
    title: "Quality Materials",
    description:
      "We carefully prepare premium materials chosen for the specific creation in hand.",
    icon: Gem,
    image: "/images/brand/about-core-2.png",
  },
  {
    title: "Handmade Care",
    description:
      "Each item is crafted by hand with attention to detail at every step of the process.",
    icon: Heart,
    image: "/images/brand/about-core-3.png",
  },
  {
    title: "Meaningful Details",
    description:
      "Personalization and finishing touches make every piece feel gift-ready and lasting.",
    icon: Leaf,
    image: "/images/brand/about-core-4.png",
  },
] as const;

const collageImages = [
  "/images/products/Sunflower-Car-Mirror-Air-Freshener-1.png",
  "/images/products/Soy-Wax-Melts-1.png",
  "/images/products/Silicone-keychain-charm-1.png",
  "/images/products/Engraved-Birth-Month-Flower-Keychain-1.png",
  "/images/products/Mama-Car-Mirror-Air-1.png",
  "/images/products/Butterfly-Car-Vent-Clip-Freshie-1.png",
  "/images/products/Highland-Cow-Car-Vent-Clip-Air-Freshener-1.png",
  "/images/products/Dog-Mom-Keychain-1.png",
  "/images/products/Silicone-Wristlet-Keychain-1.png",
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      {/* 1. Hero — matches ss 2, background image ss 3 */}
      <section className="relative isolate overflow-hidden bg-[#e8eef4]">
        <div className="absolute inset-0">
          <Image
            src="/images/brand/about-hero.png"
            alt="Handmade crafting and gift creations by RW Designs Canada"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center] lg:object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#e8eef4] via-[#e8eef4]/92 to-transparent lg:via-[#e8eef4]/55 lg:to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_40%,rgba(182,164,181,0.12),transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[480px] w-full max-w-[1200px] items-center px-4 py-12 sm:min-h-[560px] sm:px-8 sm:py-16 lg:min-h-[620px] lg:px-10 lg:py-20">
          <div className="w-full min-w-0 max-w-[540px]">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a876e] sm:mb-4 sm:text-[11px] sm:tracking-[0.2em]">
              Our Story • Made With Care
            </p>
            <h1 className="font-serif text-[2rem] font-medium leading-[1.12] tracking-[-0.02em] text-[#2f2c31] sm:text-[3.1rem] lg:text-[3.4rem]">
              Where Thoughtful Details Become Meaningful Pieces
            </h1>
            <p className="mt-4 max-w-[440px] text-[14px] leading-relaxed text-[#5c5660] sm:mt-5 sm:text-[15px]">
              At RW Designs Canada, every creation begins with care—combining
              quality materials, timeless design, and personal touches made to
              be enjoyed for years to come.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              <a
                href="#our-story"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#b1a18a] px-5 text-[13px] font-semibold text-white transition hover:bg-[#7f6e57] sm:flex-none sm:px-6"
              >
                Discover Our Story
              </a>
              <Link
                href="/what-we-create"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-[#b1a18a]/80 bg-white/60 px-5 text-[13px] font-semibold text-[#9a876e] transition hover:bg-white sm:flex-none sm:px-6"
              >
                What We Create
              </Link>
            </div>
            <p className="mt-8 font-script text-[1.25rem] leading-snug text-[#8a7585] sm:mt-10 sm:text-[1.55rem]">
              Beautifully handmade, from our hands to your home{" "}
              <Heart className="ml-1 inline h-4 w-4 fill-[#b1a18a] text-[#b1a18a]" />
            </p>
          </div>
        </div>
      </section>

      {/* 2. Brand philosophy */}
      <section id="our-story" className="scroll-mt-24 overflow-x-clip bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:gap-10 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-10">
          <div className="relative aspect-[4/5] min-w-0 overflow-hidden rounded-2xl bg-[#eef2f7] sm:aspect-[5/6]">
            <Image
              src="/images/brand/about-1.png"
              alt="Handmade creations from RW Designs Canada"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a876e]">
              Our Heart Is in the Little Things
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2f2c31] sm:text-4xl">
              {ABOUT_CONTENT.title}
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#5c5660]">
              {ABOUT_CONTENT.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Heart className="mt-8 h-5 w-5 text-[#b1a18a]" strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* 3. Core principles */}
      <section className="overflow-x-clip bg-[#f7f5f8] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a876e]">
            Our Core Principles
          </p>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-2xl border border-[#ebe6eb] bg-white"
                >
                  <div className="p-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3eef3] text-[#9a876e]">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-4 font-serif text-xl text-[#2f2c31]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#6B5B5B]">
                      {item.description}
                    </p>
                  </div>
                  <div className="relative aspect-square bg-[#eef2f7]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Dark feature */}
      <section className="overflow-x-clip bg-[#1a1a1a] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:gap-10 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10">
          <div className="min-w-0">
            <h2 className="font-serif text-[1.85rem] leading-tight text-white sm:text-3xl lg:text-4xl">
              Made With Care,
              <br />
              Chosen With Meaning
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
              Whether you’re treating yourself or searching for the perfect
              gift, our goal is to create meaningful pieces you’ll enjoy for
              years to come.
            </p>
            <Link
              href="/what-we-create"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#b1a18a] px-6 text-[13px] font-semibold text-white transition hover:bg-[#7f6e57]"
            >
              Shop the Collection
            </Link>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-3">
            {collageImages.map((src, i) => (
              <div
                key={src + i}
                className="relative aspect-square overflow-hidden rounded-lg bg-[#f0ebe7] sm:rounded-xl"
              >
                <Image
                  src={src}
                  alt={`Handmade piece ${i + 1}`}
                  fill
                  sizes="120px"
                  className="object-contain object-center p-2"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Small business story */}
      <section className="overflow-x-clip bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:gap-10 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-10">
          <div className="relative order-2 aspect-[4/5] min-w-0 overflow-hidden rounded-2xl bg-[#eef2f7] lg:order-1 sm:aspect-[5/6]">
            <Image
              src="/images/brand/about-2.png"
              alt="Crafting workspace at RW Designs Canada"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a876e]">
              A Small Business Story
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2f2c31] sm:text-4xl">
              With a Big Heart for Meaningful Details
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#5c5660]">
              Thank you for supporting our small Canadian business. We’re
              honoured to be part of your home and your special moments—from
              hand-poured fragrance to personalized gifts and custom creations
              made with care.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex text-[13px] font-semibold text-[#9a876e] underline-offset-4 hover:underline"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
