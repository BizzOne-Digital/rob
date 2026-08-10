import Image from "next/image";
import { PLACEHOLDER_IMAGES, PROCESS_STEPS } from "@/lib/constants";

const stepImages = [
  PLACEHOLDER_IMAGES.process,
  PLACEHOLDER_IMAGES.workspace,
  PLACEHOLDER_IMAGES.hands,
  PLACEHOLDER_IMAGES.engraved,
  PLACEHOLDER_IMAGES.gallery1,
  PLACEHOLDER_IMAGES.packaging,
];

export function HandmadeProcess() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl text-[#2f2a26] sm:text-4xl">
            From an Idea to Something Meaningful
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] text-[#6B5B5B]">
            A simple, thoughtful process behind every handmade piece.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#a68d7b] text-[12px] font-semibold text-white">
                {index + 1}
              </div>
              <div className="relative mx-auto mb-4 aspect-square w-full max-w-[160px] overflow-hidden rounded-xl bg-[#eef2f7]">
                <Image
                  src={stepImages[index] || PLACEHOLDER_IMAGES.process}
                  alt={step.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <h3 className="font-serif text-[16px] text-[#2f2a26]">
                {step.title.replace(/^./, (c) => c.toUpperCase())}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#6B5B5B]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
