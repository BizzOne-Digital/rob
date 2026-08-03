"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getDisplayPrice } from "@/lib/product-price";
import { Button } from "@/components/ui/Button";

interface WishItem {
  _id: string;
  name: string;
  slug: string;
  price?: number | null;
  priceVisibility?: string;
  images?: Array<{ url: string; alt?: string }>;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? data.products ?? []);
        }
      } catch {
        /* empty wishlist if API unavailable */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container className="py-14 md:py-20">
      <h1 className="font-serif text-4xl text-charcoal md:text-5xl">Wishlist</h1>
      <p className="mt-3 text-charcoal/60">Pieces you’re saving for later.</p>

      {loading ? (
        <p className="mt-10 text-sm text-charcoal/50">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="Your wishlist is empty"
            description="Browse the shop and save pieces you love."
            actionLabel="Browse shop"
            actionHref="/shop"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const price = getDisplayPrice(item);
            return (
              <Link
                key={item._id}
                href={`/shop/${item.slug}`}
                className="overflow-hidden rounded-[1.35rem] bg-white/70 shadow-[var(--shadow-soft)]"
              >
                <div className="relative aspect-[4/5] bg-powder-blue/40">
                  <ImageWithFallback
                    src={item.images?.[0]?.url}
                    alt={item.name}
                    fill
                    sizes="25vw"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-xl">{item.name}</h2>
                  <p className="mt-1 text-sm text-charcoal/60">{price.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <Button href="/shop" variant="outline">
          Continue browsing
        </Button>
      </div>
    </Container>
  );
}
