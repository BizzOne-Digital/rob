import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import {
  getPublishedCategories,
  getPublishedProducts,
  serialize,
} from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImageGrid } from "@/components/shared/ImageGrid";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop handmade candles, wax melts, freshies, keychains, engraved keepsakes, wood signs, and custom creations.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const personalizable = sp.personalizable === "1";
  const availability =
    sp.availability === "in_stock" || sp.availability === "contact"
      ? sp.availability
      : undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const limit = 24;
  const skip = (page - 1) * limit;

  const [{ items, total }, categories] = await Promise.all([
    getPublishedProducts({
      search,
      categorySlug: category,
      sort,
      personalizable: personalizable || undefined,
      availability,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      limit,
      skip,
    }),
    getPublishedCategories(),
  ]);

  const products = serialize(items);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <PageHero
        eyebrow="Shop"
        title="Handmade creations"
        description="Browse thoughtfully crafted pieces — prices shown when available, otherwise contact us for a quote."
        image={PLACEHOLDER_IMAGES.gift}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
      />

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductFilters />
          </Suspense>
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-charcoal/55">
                {total} {total === 1 ? "creation" : "creations"}
                {category
                  ? ` in ${serialize(categories).find((c) => c.slug === category)?.name ?? category}`
                  : ""}
              </p>
            </div>
            <ProductGrid products={products as never} />

            {totalPages > 1 ? (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const next = new URLSearchParams();
                  Object.entries(sp).forEach(([k, v]) => {
                    if (typeof v === "string" && k !== "page") next.set(k, v);
                  });
                  if (p > 1) next.set("page", String(p));
                  const href = `/shop${next.toString() ? `?${next}` : ""}`;
                  return (
                    <Link
                      key={p}
                      href={href}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm ${
                        p === page
                          ? "bg-charcoal text-white"
                          : "bg-white text-charcoal hover:bg-powder-blue/50"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candle" },
            { src: PLACEHOLDER_IMAGES.freshie, alt: "Freshie" },
            { src: PLACEHOLDER_IMAGES.keychain, alt: "Keychain" },
            { src: PLACEHOLDER_IMAGES.engraved, alt: "Engraved item" },
            { src: PLACEHOLDER_IMAGES.woodSign, alt: "Wood sign" },
          ]}
        />
      </Container>
    </>
  );
}
