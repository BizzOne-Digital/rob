"use client";

import { useState, type ReactNode } from "react";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartForm } from "@/components/shop/AddToCartForm";

export function ProductDetailInteractive({
  product,
  images,
  children,
}: {
  product: Parameters<typeof AddToCartForm>[0]["product"];
  images: Array<{ url: string; alt?: string }>;
  children: ReactNode;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <ProductGallery
        images={images}
        name={product.name}
        previewUrl={previewUrl}
        onPreviewClear={() => setPreviewUrl(null)}
      />
      <div>
        {children}
        <div className="mt-8">
          <AddToCartForm
            product={product}
            onOptionImageChange={setPreviewUrl}
          />
        </div>
      </div>
    </div>
  );
}
