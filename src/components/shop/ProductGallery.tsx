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
      ? images
      : [{ url: "/images/placeholders/sparkle.svg", alt: name }];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-powder-blue/35">
        <ImageWithFallback
          src={list[active]?.url}
          alt={list[active]?.alt || name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2",
                i === active ? "border-muted-mauve" : "border-transparent",
              )}
            >
              <ImageWithFallback src={img.url} alt={img.alt || name} fill sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
