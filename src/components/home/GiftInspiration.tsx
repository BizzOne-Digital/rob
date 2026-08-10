import Image from "next/image";
import Link from "next/link";
import { GIFT_OCCASIONS, PLACEHOLDER_IMAGES } from "@/lib/constants";

const images = [
  PLACEHOLDER_IMAGES.gift,
  PLACEHOLDER_IMAGES.home,
  PLACEHOLDER_IMAGES.candle,
  PLACEHOLDER_IMAGES.packaging,
  PLACEHOLDER_IMAGES.freshie,
  PLACEHOLDER_IMAGES.keychain,
];

export function GiftInspiration() {
  const occasions = GIFT_OCCASIONS.slice(0, 6);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl text-[#2f2a26] sm:text-4xl">
            Gifts for Every Moment
          </h2>
          <p className="mt-3 text-[14px] text-[#6B5B5B]">
            Browse by occasion and find something meaningful.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {occasions.map((occasion, index) => (
            <Link
              key={occasion.slug}
              href={`/collections/${occasion.slug}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef2f7]">
                <Image
                  src={images[index] || PLACEHOLDER_IMAGES.gallery1}
                  alt={occasion.name}
                  fill
                  sizes="(max-width:768px) 50vw, 16vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-center text-[13px] font-medium text-[#5c5660]">
                {occasion.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
