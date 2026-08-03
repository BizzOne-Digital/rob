"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { ImageGrid } from "@/components/shared/ImageGrid";

export default function CartPage() {
  const { items, subtotal, loading, updateQuantity, removeItem, hydrated } =
    useCartStore();

  return (
    <>
      <Container className="py-14 md:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-mauve">Your bag</p>
        <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl md:text-5xl">Shopping bag</h1>

        {!hydrated || (loading && items.length === 0) ? (
          <p className="mt-10 text-sm text-charcoal/50">Loading your bag…</p>
        ) : items.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Your bag is empty"
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
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-soft-beige bg-white/70 p-4 sm:flex-row"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-powder-blue/40 sm:h-28 sm:w-24">
                    <ImageWithFallback src={item.image} alt={item.name} fill sizes="120px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.slug ? `/what-we-create/${item.slug}` : "/what-we-create"}
                      className="font-serif text-2xl text-charcoal hover:text-muted-mauve"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel ? (
                      <p className="mt-1 text-sm text-charcoal/50">{item.variantLabel}</p>
                    ) : null}
                    <p className="mt-2 text-sm">{formatCurrency(item.price)}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="inline-flex items-center rounded-full border border-soft-beige bg-white">
                        <button
                          type="button"
                          className="p-2"
                          disabled={loading || item.quantity <= 1}
                          onClick={() => void updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2"
                          disabled={loading}
                          onClick={() => void updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-charcoal/45 hover:text-muted-mauve"
                        onClick={() => void removeItem(item._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-serif text-xl sm:self-start">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-[1.5rem] border border-soft-beige bg-gradient-to-br from-icy-blue to-powder-blue/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.14em] text-charcoal/55">
                  Subtotal
                </span>
                <span className="font-serif text-3xl">{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-3 text-xs text-charcoal/55">
                Taxes and shipping calculated at checkout.
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
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gift" },
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candle" },
            { src: PLACEHOLDER_IMAGES.home, alt: "Home" },
            { src: PLACEHOLDER_IMAGES.sparkle, alt: "Detail" },
          ]}
        />
      </Container>
    </>
  );
}
