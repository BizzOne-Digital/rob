import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/utils";

export function ImageGrid({
  images,
  className,
}: {
  images: Array<{ src: string; alt: string }>;
  className?: string;
}) {
  const items = images.slice(0, Math.max(5, images.length));

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4",
        className,
      )}
    >
      {items.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={cn(
            "relative overflow-hidden rounded-2xl bg-powder-blue/30",
            index === 0 && "col-span-2 row-span-2 aspect-square md:col-span-3",
            index === 1 && "aspect-[4/5] md:col-span-2",
            index === 2 && "aspect-square md:col-span-1",
            index === 3 && "aspect-[5/4] md:col-span-2",
            index === 4 && "aspect-square md:col-span-2",
            index > 4 && "aspect-square md:col-span-2",
          )}
        >
          <ImageWithFallback
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
