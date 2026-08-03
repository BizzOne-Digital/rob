import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

type GalleryItem = {
  _id: string;
  title?: string;
  image?: { url?: string; alt?: string } | null;
  productSlug?: string | null;
};

const fallbacks = [
  PLACEHOLDER_IMAGES.gallery1,
  PLACEHOLDER_IMAGES.gallery2,
  PLACEHOLDER_IMAGES.gallery3,
  PLACEHOLDER_IMAGES.gallery4,
  PLACEHOLDER_IMAGES.gallery5,
  PLACEHOLDER_IMAGES.candle,
];

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  const list =
    items.length > 0
      ? items.slice(0, 6)
      : fallbacks.map((url, i) => ({
          _id: `fallback-${i}`,
          title: "RW Designs Canada",
          image: { url, alt: "Handmade detail" },
        }));

  return (
    <section className="bg-[#f7f5f8] py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7f92]">
              Gallery
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#2f2c31] sm:text-4xl">
              A Glimpse Into the Details
            </h2>
          </div>
          <Link
            href="/gallery"
            className="hidden text-[13px] font-semibold text-[#9a7f92] underline-offset-4 hover:underline sm:inline"
          >
            View gallery
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {list.map((item) => {
            const href = item.productSlug
              ? `/shop/${item.productSlug}`
              : "/gallery";
            return (
              <Link
                key={item._id}
                href={href}
                className="relative aspect-square overflow-hidden rounded-lg bg-[#e8eef4]"
              >
                <Image
                  src={item.image?.url || PLACEHOLDER_IMAGES.gallery1}
                  alt={item.image?.alt || item.title || "Gallery image"}
                  fill
                  sizes="(max-width:768px) 50vw, 16vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
