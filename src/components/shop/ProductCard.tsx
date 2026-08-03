"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Badge } from "@/components/ui/Badge";
import { getDisplayPrice } from "@/lib/product-price";
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
  personalizable?: boolean;
  categorySlug?: string | null;
}

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const price = getDisplayPrice(product);

  return (
    <motion.article
      className={cn("group", className)}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-powder-blue/35">
          <ImageWithFallback
            src={product.images?.[0]?.url}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="transition duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.badge ? <Badge tone="charcoal">{product.badge}</Badge> : null}
            {product.personalizable ? <Badge tone="mauve">Personalizable</Badge> : null}
          </div>
        </div>
        <div className="px-1 pt-4">
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
        </div>
      </Link>
    </motion.article>
  );
}
