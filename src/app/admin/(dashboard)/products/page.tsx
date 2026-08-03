"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, AdminProduct } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [priceVisibility, setPriceVisibility] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
      });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      if (featured) params.set("featured", featured);
      if (priceVisibility) params.set("priceVisibility", priceVisibility);
      const data = await adminFetch<AdminListResponse<AdminProduct>>(
        `/api/admin/products?${params.toString()}`,
      );
      setItems(data.items);
      setTotal(data.total ?? data.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, q, status, featured, priceVisibility]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AdminHeader
        title="Products"
        description="Manage catalog products, variants, and inventory"
        actions={
          <Link href="/admin/products/new" className="admin-btn-primary">
            <Plus className="h-4 w-4" /> New product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="admin-input max-w-xs"
          placeholder="Search name or SKU…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          className="admin-input max-w-[160px]"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="admin-input max-w-[160px]"
          value={featured}
          onChange={(e) => {
            setPage(1);
            setFeatured(e.target.value);
          }}
        >
          <option value="">Tags: any</option>
          <option value="true">Best seller</option>
          <option value="false">Not best seller</option>
        </select>
        <select
          className="admin-input max-w-[180px]"
          value={priceVisibility}
          onChange={(e) => {
            setPage(1);
            setPriceVisibility(e.target.value);
          }}
        >
          <option value="">Visibility: any</option>
          <option value="show">Show price</option>
          <option value="contact">Contact for price</option>
        </select>
        <button type="button" className="admin-btn-secondary" onClick={() => void load()}>
          Apply
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <>
          <DataTable
            rows={items}
            rowKey={(row) => idOf(row)}
            emptyMessage="No products match these filters."
            columns={[
              {
                key: "name",
                header: "Product",
                render: (row) => (
                  <Link
                    href={`/admin/products/${row._id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {row.name}
                  </Link>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge status={row.status ?? "draft"} />,
              },
              {
                key: "tags",
                header: "Tags",
                render: (row) => {
                  const tags = [
                    row.featured ? "Best" : null,
                    row.newArrival ? "New" : null,
                    row.badge || null,
                  ].filter(Boolean);
                  return tags.length ? tags.join(", ") : "—";
                },
              },
              {
                key: "price",
                header: "Price",
                render: (row) =>
                  row.priceVisibility === "contact"
                    ? "Contact"
                    : formatCurrency(row.price),
              },
              {
                key: "inventory",
                header: "Stock",
                render: (row) => row.inventory ?? 0,
              },
              {
                key: "category",
                header: "Category",
                render: (row) => row.categorySlug || "—",
              },
            ]}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-admin-muted">
            <span>
              {total} product{total === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={page * 24 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
