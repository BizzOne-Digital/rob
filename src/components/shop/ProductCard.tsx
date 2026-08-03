"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Badge } from "@/components/ui/Badge";
import { getDisplayPrice } from "@/lib/product-price";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  priceVisibility?: string | null;
  images?: Array<{ url: string; alt?: string }>;
  badge?: string | null;
  featured?: boolean;
  newArrival?: boolean;
  personalizable?: boolean;
  categorySlug?: string | null;
  variants?: Array<{ _id?: string; name?: string; price?: number | null }> | null;
}

function needsOptions(product: ProductCardData) {
  return (
    (product.variants?.length ?? 0) > 0 || Boolean(product.personalizable)
  );
}

export function ProductCard({
  product,
  className,
  onQuickView,
}: {
  product: ProductCardData;
  className?: string;
  onQuickView?: (product: ProductCardData) => void;
}) {
  const reduce = useReducedMotion();
  const price = getDisplayPrice(product);
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);
  const complex = needsOptions(product);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!price.hasPrice) {
      toast.message("This piece is priced on request — please contact us.");
      return;
    }

    if (complex) {
      if (onQuickView) onQuickView(product);
      else toast.message("Choose options on the product page");
      return;
    }

    setAdding(true);
    const result = await addItem({
      productId: String(product._id),
      quantity: 1,
    });
    setAdding(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not add to bag");
    } else {
      toast.success("Added to your bag");
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <motion.article
      className={cn("group", className)}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.3 }}
    >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-[#f0ebe7]">
        <Link href={`/what-we-create/${product.slug}`} className="absolute inset-0">
          <ImageWithFallback
            src={product.images?.[0]?.url}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain object-center p-4 transition duration-700 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {product.newArrival ? <Badge tone="blue">New</Badge> : null}
          {product.featured ? <Badge tone="mauve">Best</Badge> : null}
          {product.badge ? <Badge tone="charcoal">{product.badge}</Badge> : null}
          {product.personalizable ? (
            <Badge tone="mauve">Personalizable</Badge>
          ) : null}
        </div>

        <div className="absolute inset-x-2 bottom-2 z-10 flex gap-1.5 opacity-100 transition duration-300 sm:inset-x-3 sm:bottom-3 sm:gap-2 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          {onQuickView ? (
            <button
              type="button"
              onClick={handleQuickView}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-white/95 px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-charcoal shadow-sm backdrop-blur transition hover:bg-white sm:h-10 sm:gap-1.5 sm:px-3 sm:text-[11px] sm:tracking-[0.08em]"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
              View
            </button>
          ) : null}
          <button
            type="button"
            onClick={(e) => void handleQuickAdd(e)}
            disabled={adding}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-[#b08d9e] px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-white shadow-sm transition hover:bg-[#9f7d8e] disabled:opacity-60 sm:h-10 sm:gap-1.5 sm:px-3 sm:text-[11px] sm:tracking-[0.08em]"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} />
            {adding ? "…" : complex ? "Options" : "Add"}
          </button>
        </div>
      </div>

      <Link href={`/what-we-create/${product.slug}`} className="block px-1 pt-4">
        <h3 className="font-serif text-xl text-charcoal transition group-hover:text-muted-mauve">
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm text-charcoal/55">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-medium text-charcoal">{price.label}</span>
          {price.compareAt ? (
            <span className="text-xs text-charcoal/40 line-through">
              {price.compareAt}
            </span>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
