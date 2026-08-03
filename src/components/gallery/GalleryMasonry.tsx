"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function GalleryMasonry({
  items,
}: {
  items: Array<{
    _id: string;
    title: string;
    caption?: string | null;
    image?: { url?: string; alt?: string } | null;
  }>;
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
        {items.map((item, index) => (
          <button
            key={item._id}
            type="button"
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
            onClick={() => setActive(index)}
          >
            <div
              className={`relative ${
                index % 4 === 0
                  ? "aspect-[4/5]"
                  : index % 4 === 1
                    ? "aspect-square"
                    : index % 4 === 2
                      ? "aspect-[5/4]"
                      : "aspect-[3/4]"
              }`}
            >
              <ImageWithFallback
                src={item.image?.url}
                alt={item.image?.alt || item.title}
                fill
                sizes="25vw"
                className="transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/50 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
              <p className="font-serif text-lg text-white">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active != null && items[active] ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full bg-white/20 p-2 text-white"
              onClick={() => setActive(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[1.5rem] bg-warm-ivory"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={items[active].image?.url}
                alt={items[active].image?.alt || items[active].title}
                fill
                sizes="80vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent p-5 text-white">
                <p className="font-serif text-2xl">{items[active].title}</p>
                {items[active].caption ? (
                  <p className="mt-1 text-sm text-white/80">{items[active].caption}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
