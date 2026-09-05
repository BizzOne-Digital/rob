import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { PRODUCT_IMAGE_COVER_CLASS, PRODUCT_IMAGE_SURFACE } from "@/lib/product-images";
import { cn } from "@/lib/utils";

type GalleryPreviewItem = {
  _id: string;
  title?: string;
  image?: { url?: string; alt?: string };
};

export function GalleryPreview({ items }: { items: GalleryPreviewItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="overflow-x-clip bg-[#f7f3ee] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <h2 className="font-serif text-[1.85rem] text-[#2f2a26] sm:text-3xl lg:text-4xl">
            A Glimpse Into the Details
          </h2>
          <Link
            href="/gallery"
            className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#8f7665] hover:text-taupe sm:inline"
          >
            View gallery
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {items.map((item) => (
            <Link
              key={String(item._id)}
              href="/gallery"
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg",
                PRODUCT_IMAGE_SURFACE,
              )}
            >
              <ImageWithFallback
                src={item.image?.url}
                alt={item.image?.alt || item.title || "Gallery photo"}
                fill
                sizes="(max-width:768px) 50vw, 16vw"
                className={cn(
                  PRODUCT_IMAGE_COVER_CLASS,
                  "transition duration-500 group-hover:scale-105",
                )}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
