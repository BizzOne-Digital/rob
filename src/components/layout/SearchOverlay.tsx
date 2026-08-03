"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getDisplayPrice } from "@/lib/product-price";

interface SearchItem {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price?: number | null;
  priceVisibility?: string;
  images?: Array<{ url: string; alt?: string }>;
  categorySlug?: string;
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      if (!q.trim()) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`);
        const data = await res.json();
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [q, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[85] bg-charcoal/35 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="mx-auto mt-8 w-[min(720px,92vw)] overflow-hidden rounded-[1.5rem] bg-warm-ivory shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-soft-beige px-5 py-4">
              <Search className="h-5 w-5 text-muted-mauve" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search creations..."
                className="w-full bg-transparent text-base outline-none placeholder:text-charcoal/40"
              />
              <button type="button" aria-label="Close search" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {loading ? (
                <p className="px-3 py-8 text-center text-sm text-charcoal/50">Searching…</p>
              ) : null}
              {!loading && q && items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-charcoal/50">
                  No creations found for “{q}”.
                </p>
              ) : null}
              <ul className="space-y-1">
                {items.map((item) => {
                  const price = getDisplayPrice(item);
                  return (
                    <li key={item._id}>
                      <Link
                        href={`/what-we-create/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-powder-blue/40"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-powder-blue/40">
                          <ImageWithFallback
                            src={item.images?.[0]?.url}
                            alt={item.images?.[0]?.alt ?? item.name}
                            fill
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-lg text-charcoal">
                            {item.name}
                          </p>
                          <p className="text-xs text-charcoal/50">
                            {price.hasPrice ? price.label : "Contact for Price"}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {q ? (
                <Link
                  href={`/what-we-create?search=${encodeURIComponent(q)}`}
                  onClick={onClose}
                  className="mt-2 block rounded-xl px-3 py-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-mauve hover:bg-powder-blue/30"
                >
                  View all results
                </Link>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
