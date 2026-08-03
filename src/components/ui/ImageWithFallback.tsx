"use client";

import Image from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  fallback = PLACEHOLDER_IMAGES.sparkle,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallback?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? fallback : src;
  const isSvg = resolved.endsWith(".svg");

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn("object-cover", className)}
      sizes={sizes}
      priority={priority}
      unoptimized={isSvg}
      onError={() => setFailed(true)}
    />
  );
}
