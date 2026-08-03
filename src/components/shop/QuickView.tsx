"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Button } from "@/components/ui/Button";
import { getDisplayPrice } from "@/lib/product-price";
import type { ProductCardData } from "./ProductCard";

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: ProductCardData | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!product) return null;
  const price = getDisplayPrice(product);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="grid w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-warm-ivory md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square bg-powder-blue/40">
              <ImageWithFallback
                src={product.images?.[0]?.url}
                alt={product.name}
                fill
                sizes="50vw"
              />
            </div>
            <div className="relative p-6 md:p-8">
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-powder-blue/50"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="pr-8 font-serif text-3xl text-charcoal">{product.name}</h3>
              <p className="mt-3 text-sm text-charcoal/60">{price.label}</p>
              {product.shortDescription ? (
                <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
                  {product.shortDescription}
                </p>
              ) : null}
              <Button href={`/shop/${product.slug}`} className="mt-8" onClick={onClose}>
                View details
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function useQuickView() {
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [open, setOpen] = useState(false);
  return {
    product,
    open,
    openQuickView: (p: ProductCardData) => {
      setProduct(p);
      setOpen(true);
    },
    closeQuickView: () => setOpen(false),
  };
}
