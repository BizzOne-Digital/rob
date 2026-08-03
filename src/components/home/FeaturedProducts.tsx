import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { getDisplayPrice } from "@/lib/product-price";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price?: number | null;
  priceVisibility?: string | null;
  images?: Array<{ url?: string; alt?: string } | null>;
};

export function FeaturedProducts({ products }: { products: Product[] }) {
  const list = products.slice(0, 4);

  return (
    <section className="bg-[#f7f5f8] py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl text-[#2f2c31] sm:text-4xl">
            Thoughtful Favorites
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-[#c9b4c4]" />
        </div>

        {list.length === 0 ? (
          <p className="text-center text-sm text-[#6B5B5B]">
            Favorites will appear here once products are published.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((product) => {
              const price = getDisplayPrice(product);
              const img =
                product.images?.[0]?.url || PLACEHOLDER_IMAGES.gallery1;
              return (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-xl border border-[#ebe6eb] bg-white shadow-[0_8px_24px_rgba(20,20,20,0.04)]"
                >
                  <div className="relative aspect-[4/5] bg-[#eef2f7]">
                    <Image
                      src={img}
                      alt={product.images?.[0]?.alt || product.name}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#8a7585]"
                    >
                      <Heart className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-[17px] leading-snug text-[#2f2c31]">
                      {product.name}
                    </h3>
                    <p className="text-[13px] text-[#6B5B5B]">
                      {price.hasPrice
                        ? `Starting at ${formatCurrency(product.price)}`
                        : "Contact for Price"}
                    </p>
                    <Link
                      href={`/shop/${product.slug}`}
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#d9c9d4] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B5B5B] transition hover:border-[#b08d9e] hover:text-[#9a7f92]"
                    >
                      View Product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#b08d9e] px-7 text-[13px] font-semibold text-white transition hover:bg-[#9f7d8e]"
          >
            Shop all favorites
          </Link>
        </div>
      </div>
    </section>
  );
}
