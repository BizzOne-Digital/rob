"use client";

import { ProductCard, type ProductCardData } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function ProductGrid({
  products,
}: {
  products: ProductCardData[];
}) {
  if (!products.length) {
    return (
      <EmptyState
        title="No creations found"
        description="Try adjusting your filters, or clear them to see all creations."
        actionLabel="View all"
        actionHref="/what-we-create"
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((item) => (
        <ProductCard key={item._id} product={item} />
      ))}
    </div>
  );
}
