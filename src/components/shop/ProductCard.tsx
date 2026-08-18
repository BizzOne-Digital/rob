"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getDisplayPrice } from "@/lib/product-price";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  priceVisibility?: string | null;
  sku?: string | null;
  images?: Array<{ url: string; alt?: string }>;
  badge?: string | null;
  featured?: boolean;
  newArrival?: boolean;
  personalizable?: boolean;
  categorySlug?: string | null;
  variants?: Array<{ _id?: string; name?: string; price?: number | null }> | null;
}

function cardBadge(product: ProductCardData, hasPrice: boolean) {
  if (product.newArrival) return "NEW";
  if (product.priceVisibility === "contact" || !hasPrice) return "COMING SOON";
  if (product.badge) return product.badge.toUpperCase();
  return null;
}

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  const price = getDisplayPrice(product);
  const comingSoon = product.priceVisibility === "contact" || !price.hasPrice;
  const badge = cardBadge(product, price.hasPrice);
  const displayPrice = comingSoon
    ? formatCurrency(0)
    : price.hasPrice
      ? price.label
      : "Contact for Price";

  const [wished, setWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setWishLoading(true);
    try {
      if (wished) {
        await fetch(`/api/wishlist?productId=${product._id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setWished(false);
        toast.message("Removed from wishlist");
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
        if (!res.ok) throw new Error("Failed");
        setWished(true);
        toast.success("Saved to wishlist");
      }
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <article className={cn("group min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4", className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
        <Link href={`/what-we-create/${product.slug}`} className="absolute inset-0">
          <ImageWithFallback
            src={product.images?.[0]?.url}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            quality={90}
            className="object-contain object-center p-4 transition duration-500 group-hover:scale-105"
          />
        </Link>

        {badge ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f2a26] shadow-sm">
            {badge}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-0 items-center justify-center gap-2 bg-gradient-to-t from-black/20 to-transparent pb-3 pt-6 opacity-100 sm:translate-y-full sm:opacity-0 sm:transition-all sm:duration-300 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <Link
            href={`/what-we-create/${product.slug}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white text-[#2f2a26] shadow-lg transition active:scale-95 sm:h-10 sm:w-10 sm:hover:scale-110 sm:hover:bg-taupe sm:hover:text-white"
            aria-label="View product details"
          >
            <Eye className="h-5 w-5" strokeWidth={2} />
          </Link>

          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishLoading}
            onClick={(e) => void toggleWishlist(e)}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white text-[#2f2a26] shadow-lg transition active:scale-95 disabled:opacity-60 sm:h-10 sm:w-10 sm:hover:scale-110 sm:hover:bg-taupe sm:hover:text-white",
              wished && "bg-taupe text-white",
            )}
          >
            <Heart
              className={cn("h-5 w-5", wished && "fill-white")}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <Link
        href={`/what-we-create/${product.slug}`}
        className="mt-4 block min-w-0"
      >
        <h3 className="line-clamp-2 font-serif text-[14px] leading-snug text-[#2f2a26] transition group-hover:text-taupe sm:text-[16px]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-bold text-[#2f2a26]">
            {displayPrice}
          </span>
        </div>

        {comingSoon ? (
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8f7665]">
            Coming Soon
          </p>
        ) : null}
      </Link>
    </article>
  );
}
