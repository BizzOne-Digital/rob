"use client";

import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/shop/ProductCard";

type Product = ProductCardData;

export function FeaturedProducts({ products }: { products: Product[] }) {
  const list = products.slice(0, 6);

  return (
    <section className="overflow-x-clip bg-[#f7f3ee] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-serif text-[1.85rem] text-[#2f2a26] sm:text-3xl lg:text-4xl">
            Thoughtful Favorites
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-[#c9b4c4]" />
        </div>

        {list.length === 0 ? (
          <p className="text-center text-sm text-[#6B5B5B]">
            Favorites will appear here once products are published.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/what-we-create"
            className="inline-flex h-11 items-center justify-center rounded-full bg-taupe px-7 text-[13px] font-semibold !text-white transition hover:bg-taupe-deep"
          >
            Shop all favorites
          </Link>
        </div>
      </div>
    </section>
  );
}
