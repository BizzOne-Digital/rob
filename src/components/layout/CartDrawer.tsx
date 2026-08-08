"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, loading, updateQuantity, removeItem } =
    useCartStore();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-[90] bg-charcoal/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col bg-warm-ivory shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-soft-beige px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-mauve" />
                <h2 className="font-serif text-2xl">Your bag</h2>
              </div>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-powder-blue/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-serif text-2xl text-charcoal">Your bag is empty</p>
                  <p className="mt-2 text-sm text-charcoal/55">
                    Discover handmade pieces made to gift and keep.
                  </p>
                  <Button
                    href="/what-we-create"
                    variant="secondary"
                    className="mt-6"
                    onClick={() => setOpen(false)}
                  >
                    Browse shop
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item._id}
                      className="flex gap-3 rounded-2xl border border-soft-beige/80 bg-white/70 p-3"
                    >
                      <div className="relative h-24 w-20 overflow-hidden rounded-xl bg-powder-blue/40">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.slug ? `/what-we-create/${item.slug}` : "/what-we-create"}
                          onClick={() => setOpen(false)}
                          className="font-serif text-lg leading-tight text-charcoal hover:text-muted-mauve"
                        >
                          {item.name}
                        </Link>
                        {item.variantLabel ? (
                          <p className="mt-1 text-xs text-charcoal/50">{item.variantLabel}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-charcoal/70">
                          {formatCurrency(item.price)}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-soft-beige bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="p-2"
                              disabled={loading || item.quantity <= 1}
                              onClick={() =>
                                void updateQuantity(item._id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="p-2"
                              disabled={loading}
                              onClick={() =>
                                void updateQuantity(item._id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-xs uppercase tracking-[0.12em] text-charcoal/45 hover:text-muted-mauve"
                            onClick={() => void removeItem(item._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-soft-beige px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.14em] text-charcoal/55">
                    Subtotal
                  </span>
                  <span className="font-serif text-2xl">{formatCurrency(subtotal)}</span>
                </div>
                <div className="grid gap-2">
                  <Button href="/checkout" onClick={() => setOpen(false)}>
                    Checkout
                  </Button>
                  <Button
                    href="/cart"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    View bag
                  </Button>
                </div>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
