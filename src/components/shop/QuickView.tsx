"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Button } from "@/components/ui/Button";
import { getDisplayPrice } from "@/lib/product-price";
import { useCartStore } from "@/store/cart";
import type { ProductCardData } from "./ProductCard";

function needsOptions(product: ProductCardData) {
  return (
    (product.variants?.length ?? 0) > 0 || Boolean(product.personalizable)
  );
}

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: ProductCardData | null;
  open: boolean;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const price = getDisplayPrice(product);
  const complex = needsOptions(product);

  const handleAdd = async () => {
    if (!price.hasPrice) {
      toast.message("This piece is priced on request — please contact us.");
      return;
    }
    if (complex) {
      toast.message("Choose options on the product page");
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
      return;
    }

    toast.success("Added to your bag");
    onClose();
  };

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
            className="grid max-h-[90vh] w-full max-w-3xl overflow-hidden overflow-y-auto rounded-[1.25rem] bg-warm-ivory sm:rounded-[1.75rem] md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square bg-[#e8e0d6] md:aspect-auto md:min-h-[420px]">
              <ImageWithFallback
                src={product.images?.[0]?.url}
                alt={product.name}
                fill
                sizes="50vw"
                quality={90}
                className="object-cover object-center"
              />
            </div>
            <div className="relative flex flex-col p-6 md:p-8">
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-powder-blue/50"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="pr-8 font-serif text-3xl text-charcoal">
                {product.name}
              </h3>
              <p className="mt-3 text-sm font-medium text-charcoal">
                {price.label}
              </p>
              {product.shortDescription ? (
                <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
                  {product.shortDescription}
                </p>
              ) : null}
              {complex ? (
                <p className="mt-4 text-xs text-charcoal/50">
                  This piece has options or personalization — open the full
                  page to customize before adding.
                </p>
              ) : null}

              <div className="mt-auto flex flex-col gap-3 pt-8">
                {price.hasPrice && !complex ? (
                  <Button
                    type="button"
                    className="w-full !text-white"
                    disabled={adding}
                    onClick={() => void handleAdd()}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {adding ? "Adding…" : "Quick add to bag"}
                  </Button>
                ) : null}
                <Button
                  href={`/what-we-create/${product.slug}`}
                  variant={price.hasPrice && !complex ? "outline" : "secondary"}
                  className={
                    price.hasPrice && !complex
                      ? "w-full"
                      : "w-full !text-white"
                  }
                  onClick={onClose}
                >
                  {complex ? "Choose options" : "View full details"}
                </Button>
                {!price.hasPrice ? (
                  <Link
                    href={`/contact?product=${product.slug}`}
                    onClick={onClose}
                    className="text-center text-xs text-charcoal/50 underline-offset-2 hover:underline"
                  >
                    Contact about this piece
                  </Link>
                ) : null}
              </div>
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
