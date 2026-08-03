import Image from "next/image";
import Link from "next/link";

export function AboutPreview() {
  return (
    <section className="overflow-x-clip bg-[#efeaf0] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10">
        <div className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-2xl bg-[#f0ebe7]">
          <Image
            src="/images/brand/home-2.png"
            alt="Handmade pieces crafted with care at RW Designs Canada"
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-contain object-center p-3 sm:p-4"
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7f92]">
            Our Story
          </p>
          <h2 className="mt-3 font-serif text-[1.85rem] leading-tight text-[#2f2c31] sm:text-3xl lg:text-4xl">
            Made With Care,
            <br />
            Meant to be Kept
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#5c5660]">
            At RW Designs Canada, we believe the little details make everyday
            moments more meaningful. Every piece is thoughtfully handcrafted
            with a focus on quality, timeless design, and lasting beauty.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#b08d9e] px-6 text-[13px] font-semibold text-white transition hover:bg-[#9f7d8e]"
          >
            Shop our story
          </Link>
        </div>
      </div>
    </section>
  );
}
