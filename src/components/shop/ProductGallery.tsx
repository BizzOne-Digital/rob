"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: Array<{ url: string; alt?: string }>;
  name: string;
}) {
  const list =
    images.length > 0
      ? images.slice(0, 2)
      : [{ url: "/images/placeholders/sparkle.svg", alt: name }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)] ?? list[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-[#e6d9c8]">
        <ImageWithFallback
          src={current?.url}
          alt={current?.alt || name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          quality={92}
          className="object-cover object-center"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#e6d9c8] transition",
                i === active
                  ? "border-muted-mauve"
                  : "border-transparent hover:border-soft-beige",
              )}
            >
              <ImageWithFallback
                src={img.url}
                alt={img.alt || name}
                fill
                sizes="80px"
                quality={85}
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
