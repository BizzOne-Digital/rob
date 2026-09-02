"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getDisplayPrice } from "@/lib/product-price";
import {
  PRODUCT_IMAGE_COVER_CLASS,
  PRODUCT_IMAGE_SURFACE,
} from "@/lib/product-images";
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

  const desktopActionClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-[#2f2a26] shadow-lg transition active:scale-95 hover:scale-110 hover:bg-taupe hover:text-white disabled:opacity-60";

  const mobileActionClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/35 text-[#2f2a26] transition active:scale-95 disabled:opacity-60";

  return (
    <article
      className={cn(
        "group min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4",
        className,
      )}
    >
      <div className="overflow-hidden rounded-xl">
        <div className={cn("relative aspect-square w-full", PRODUCT_IMAGE_SURFACE)}>
          <Link
            href={`/what-we-create/${product.slug}`}
            className="absolute inset-0 block"
          >
            <ImageWithFallback
              src={product.images?.[0]?.url}
              alt={product.images?.[0]?.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              quality={90}
              className={cn(
                PRODUCT_IMAGE_COVER_CLASS,
                "transition duration-500 group-hover:scale-105",
              )}
            />
          </Link>

          {badge ? (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f2a26] shadow-sm">
              {badge}
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-black/20 to-transparent pb-3 pt-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
            <Link
              href={`/what-we-create/${product.slug}`}
              className={desktopActionClass}
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
                desktopActionClass,
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

        <div className="flex items-center justify-center gap-4 border-t border-[#aeb6a6]/60 bg-sage py-2.5 sm:hidden">
          <Link
            href={`/what-we-create/${product.slug}`}
            className={mobileActionClass}
            aria-label="View product details"
          >
            <Eye className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishLoading}
            onClick={(e) => void toggleWishlist(e)}
            className={cn(
              mobileActionClass,
              wished && "bg-taupe text-white",
            )}
          >
            <Heart
              className={cn("h-5 w-5", wished && "fill-white")}
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 text-center sm:hidden">
        <Link href={`/what-we-create/${product.slug}`} className="block">
          <h3 className="line-clamp-2 px-1 font-serif text-[14px] leading-snug text-[#2f2a26]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-[15px] font-bold text-[#2f2a26]">
          {displayPrice}
        </p>

        {comingSoon ? (
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8f7665]">
            Coming Soon
          </p>
        ) : null}
      </div>

      <Link
        href={`/what-we-create/${product.slug}`}
        className="mt-4 hidden min-w-0 sm:block"
      >
        <h3 className="line-clamp-2 font-serif text-[16px] leading-snug text-[#2f2a26] transition group-hover:text-taupe">
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
