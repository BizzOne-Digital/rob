"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
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
    <article className={cn("group min-w-0", className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#f7f3ee]">
        <Link href={`/what-we-create/${product.slug}`} className="absolute inset-0">
          <ImageWithFallback
            src={product.images?.[0]?.url}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            quality={90}
            className="object-contain object-center transition duration-500 group-hover:scale-[1.01]"
          />
        </Link>

        {badge ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f2a26] shadow-sm">
            {badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishLoading}
          onClick={(e) => void toggleWishlist(e)}
          className={cn(
            "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2f2a26]/15 bg-white/95 text-[#2f2a26] shadow-sm transition hover:bg-white disabled:opacity-60",
            wished && "border-taupe text-taupe",
          )}
        >
          <Heart
            className={cn("h-4 w-4", wished && "fill-taupe")}
            strokeWidth={1.6}
          />
        </button>
      </div>

      <Link
        href={`/what-we-create/${product.slug}`}
        className="mt-3 block min-w-0"
      >
        <h3 className="line-clamp-2 font-serif text-[15px] leading-snug text-[#2f2a26] transition group-hover:text-taupe sm:text-[16px]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="text-[14px] font-semibold text-[#2f2a26]">
            {displayPrice}
          </span>
          {product.sku ? (
            <span className="shrink-0 text-[11px] uppercase tracking-[0.06em] text-[#6b6258]">
              SKU {product.sku}
            </span>
          ) : null}
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
