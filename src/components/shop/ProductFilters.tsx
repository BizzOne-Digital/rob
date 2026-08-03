"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function ProductFilters({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    startTransition(() => {
      router.push(`/what-we-create?${next.toString()}`);
    });
  };

  return (
    <aside className={cn("space-y-6", pending && "opacity-70", className)}>
      <FilterBlock title="Search">
        <input
          defaultValue={params.get("search") ?? ""}
          placeholder="Search creations"
          className="h-11 w-full rounded-full border border-soft-beige bg-white px-4 text-sm outline-none focus:border-muted-mauve"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("search", (e.target as HTMLInputElement).value.trim());
            }
          }}
        />
      </FilterBlock>

      <FilterBlock title="Price">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={params.get("minPrice") ?? ""}
            className="h-11 rounded-full border border-soft-beige bg-white px-4 text-sm outline-none"
            onBlur={(e) => update("minPrice", e.target.value)}
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={params.get("maxPrice") ?? ""}
            className="h-11 rounded-full border border-soft-beige bg-white px-4 text-sm outline-none"
            onBlur={(e) => update("maxPrice", e.target.value)}
          />
        </div>
      </FilterBlock>

      <FilterBlock title="Availability">
        <select
          className="h-11 w-full rounded-full border border-soft-beige bg-white px-4 text-sm outline-none"
          value={params.get("availability") ?? ""}
          onChange={(e) => update("availability", e.target.value)}
        >
          <option value="">All</option>
          <option value="in_stock">Ready to purchase</option>
          <option value="contact">Contact for price</option>
        </select>
      </FilterBlock>

      <FilterBlock title="Personalizable">
        <label className="flex items-center gap-3 text-sm text-charcoal/70">
          <input
            type="checkbox"
            checked={params.get("personalizable") === "1"}
            onChange={(e) =>
              update("personalizable", e.target.checked ? "1" : "")
            }
          />
          Show personalizable only
        </label>
      </FilterBlock>

      <FilterBlock title="Sort">
        <select
          className="h-11 w-full rounded-full border border-soft-beige bg-white px-4 text-sm outline-none"
          value={params.get("sort") ?? "newest"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="featured">Featured</option>
          <option value="name">Name</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
      </FilterBlock>
    </aside>
  );
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal/45">
        {title}
      </p>
      {children}
    </div>
  );
}
