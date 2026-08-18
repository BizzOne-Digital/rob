"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { SHIPPING_CART_SUMMARY } from "@/lib/shipping";

export default function CartPage() {
  const { items, subtotal, loading, updateQuantity, removeItem, hydrated } =
    useCartStore();

  return (
    <>
      <Container className="py-10 md:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-mauve">Your cart</p>
        <h1 className="mt-2 font-serif text-2xl text-charcoal sm:text-4xl md:text-5xl">Shopping cart</h1>

        {!hydrated || (loading && items.length === 0) ? (
          <p className="mt-10 text-sm text-charcoal/50">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Your cart is empty"
              description="Discover handmade pieces made to gift and keep."
              actionLabel="Browse shop"
              actionHref="/what-we-create"
            />
          </div>
        ) : (
          <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
            <ul className="min-w-0 space-y-4">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="flex gap-4 rounded-[1.5rem] border border-soft-beige bg-white/70 p-4"
                >
                  <Link
                    href={item.slug ? `/what-we-create/${item.slug}` : "/what-we-create"}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f3ee] sm:h-28 sm:w-28"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-contain object-center p-1.5"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.slug ? `/what-we-create/${item.slug}` : "/what-we-create"}
                      className="font-serif text-lg leading-snug text-charcoal hover:text-muted-mauve sm:text-2xl"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel ? (
                      <p className="mt-1 text-sm text-charcoal/50">{item.variantLabel}</p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between gap-3 sm:mt-2 sm:block">
                      <p className="text-sm">{formatCurrency(item.price)}</p>
                      <p className="font-serif text-lg sm:hidden">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="inline-flex items-center rounded-full border border-soft-beige bg-white">
                        <button
                          type="button"
                          className="touch-target inline-flex items-center justify-center"
                          disabled={loading || item.quantity <= 1}
                          onClick={() => void updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="touch-target inline-flex items-center justify-center"
                          disabled={loading}
                          onClick={() => void updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="touch-target inline-flex items-center gap-1 px-2 text-xs uppercase tracking-[0.12em] text-charcoal/45 hover:text-muted-mauve"
                        onClick={() => void removeItem(item._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="hidden font-serif text-xl sm:block sm:self-start">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <aside className="sticky bottom-0 z-10 -mx-4 border-t border-soft-beige bg-gradient-to-br from-[#eef1ea] to-[#e8e0d6]/95 p-4 backdrop-blur-sm safe-bottom sm:mx-0 sm:rounded-[1.5rem] sm:border sm:p-6 lg:static lg:border-t-0 lg:bg-gradient-to-br lg:from-[#eef1ea] lg:to-[#e8e0d6]/80 lg:backdrop-blur-none">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.14em] text-charcoal/55">
                  Subtotal
                </span>
                <span className="font-serif text-3xl">{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-3 text-xs text-charcoal/55">
                {SHIPPING_CART_SUMMARY}
              </p>
              <Button href="/checkout" className="mt-6 w-full">
                Checkout
              </Button>
              <Button href="/what-we-create" variant="outline" className="mt-3 w-full">
                Continue shopping
              </Button>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
