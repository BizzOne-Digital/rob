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
        description="Try adjusting your filters or browse What We Create for inspiration."
        actionLabel="What We Create"
        actionHref="/what-we-create"
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
