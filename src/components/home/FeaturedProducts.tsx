"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { getDisplayPrice } from "@/lib/product-price";
import { useCartStore } from "@/store/cart";
import { QuickView, useQuickView } from "@/components/shop/QuickView";
import type { ProductCardData } from "@/components/shop/ProductCard";

type Product = ProductCardData;

export function FeaturedProducts({ products }: { products: Product[] }) {
  const list = products.slice(0, 6);
  const addItem = useCartStore((s) => s.addItem);
  const { product, open, openQuickView, closeQuickView } = useQuickView();
  const [addingId, setAddingId] = useState<string | null>(null);

  const quickAdd = async (item: Product) => {
    const price = getDisplayPrice(item);
    if (!price.hasPrice) {
      toast.message("This piece is priced on request — please contact us.");
      return;
    }
    if ((item.variants?.length ?? 0) > 0 || item.personalizable) {
      openQuickView(item);
      return;
    }
    setAddingId(item._id);
    const result = await addItem({ productId: String(item._id), quantity: 1 });
    setAddingId(null);
    if (!result.ok) toast.error(result.error ?? "Could not add to bag");
    else toast.success("Added to your bag");
  };

  return (
    <section className="overflow-x-clip bg-[#f7f5f8] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-serif text-[1.85rem] text-[#2f2c31] sm:text-3xl lg:text-4xl">
            Thoughtful Favorites
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-[#c9b4c4]" />
        </div>

        {list.length === 0 ? (
          <p className="text-center text-sm text-[#6B5B5B]">
            Favorites will appear here once products are published.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {list.map((item) => {
              const price = getDisplayPrice(item);
              const img =
                item.images?.[0]?.url || PLACEHOLDER_IMAGES.gallery1;
              return (
                <article
                  key={item._id}
                  className="group min-w-0 overflow-hidden rounded-xl border border-[#ebe6eb] bg-white shadow-[0_8px_24px_rgba(20,20,20,0.04)]"
                >
                  <div className="relative aspect-[4/5] bg-[#f0ebe7]">
                    <Link href={`/what-we-create/${item.slug}`}>
                      <Image
                        src={img}
                        alt={item.images?.[0]?.alt || item.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-contain object-center p-4 transition duration-500 group-hover:scale-[1.02]"
                      />
                    </Link>
                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#8a7585]"
                    >
                      <Heart className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                    <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-100 transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openQuickView(item)}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-white/95 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B5B5B]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => void quickAdd(item)}
                        disabled={addingId === item._id}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-[#b08d9e] text-[11px] font-semibold uppercase tracking-[0.06em] text-white disabled:opacity-60"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {addingId === item._id ? "…" : "Add"}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-[17px] leading-snug text-[#2f2c31]">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-[#6B5B5B]">
                      {price.hasPrice
                        ? `Starting at ${formatCurrency(item.price)}`
                        : "Contact for Price"}
                    </p>
                    <Link
                      href={`/what-we-create/${item.slug}`}
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
            href="/what-we-create"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#b08d9e] px-7 text-[13px] font-semibold text-white transition hover:bg-[#9f7d8e]"
          >
            Shop all favorites
          </Link>
        </div>
      </div>

      <QuickView product={product} open={open} onClose={closeQuickView} />
    </section>
  );
}
