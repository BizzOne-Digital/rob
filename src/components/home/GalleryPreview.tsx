import Image from "next/image";

const GALLERY_IMAGES = [
  {
    src: "/images/brand/home-gallery-1.png",
    alt: "Handmade detail — gallery 1",
  },
  {
    src: "/images/brand/home-gallery-2.png",
    alt: "Handmade detail — gallery 2",
  },
  {
    src: "/images/brand/home-gallery-3.png",
    alt: "Handmade detail — gallery 3",
  },
  {
    src: "/images/brand/home-gallery-4.png",
    alt: "Handmade detail — gallery 4",
  },
  {
    src: "/images/brand/home-gallery-5.png",
    alt: "Handmade detail — gallery 5",
  },
  {
    src: "/images/brand/home-gallery-6.png",
    alt: "Handmade detail — gallery 6",
  },
] as const;

export function GalleryPreview() {
  return (
    <section className="overflow-x-clip bg-[#f7f5f8] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
        <div className="mb-6 sm:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7f92]">
            Gallery
          </p>
          <h2 className="mt-2 font-serif text-[1.85rem] text-[#2f2c31] sm:text-3xl lg:text-4xl">
            A Glimpse Into the Details
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {GALLERY_IMAGES.map((item) => (
            <div
              key={item.src}
              className="relative aspect-square overflow-hidden rounded-lg bg-[#f0ebe7]"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width:768px) 50vw, 16vw"
                className="object-contain object-center p-3 transition duration-500 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
