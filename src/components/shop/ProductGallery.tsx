"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import {
  PRODUCT_IMAGE_CLASS,
  PRODUCT_IMAGE_SURFACE,
  PRODUCT_IMAGE_THUMB_CLASS,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  previewUrl,
  onPreviewClear,
}: {
  images: Array<{ url: string; alt?: string }>;
  name: string;
  previewUrl?: string | null;
  onPreviewClear?: () => void;
}) {
  const list =
    images.length > 0
      ? images.slice(0, 2)
      : [{ url: "/images/placeholders/sparkle.svg", alt: name }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)] ?? list[0];
  const displayUrl = previewUrl ?? current?.url;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem]",
          PRODUCT_IMAGE_SURFACE,
        )}
      >
        <ImageWithFallback
          src={displayUrl}
          alt={current?.alt || name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          quality={92}
          className={PRODUCT_IMAGE_CLASS}
        />
      </div>
      {list.length > 1 ? (
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => {
                onPreviewClear?.();
                setActive(i);
              }}
              aria-label={`View photo ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20",
                PRODUCT_IMAGE_SURFACE,
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
                className={PRODUCT_IMAGE_THUMB_CLASS}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
