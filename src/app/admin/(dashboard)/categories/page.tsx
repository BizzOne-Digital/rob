"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type {
  AdminListResponse,
  CreationCategoryItem,
} from "@/lib/admin/types";

/** Product category management — mirrors CreationCategory / What We Create */
export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CreationCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<CreationCategoryItem>>(
        "/api/admin/categories",
      );
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AdminHeader
        title="Categories"
        description="Product creation categories used across the catalog"
        actions={
          <Link href="/admin/what-we-create" className="admin-btn-secondary">
            Open What We Create
          </Link>
        }
      />

      <p className="mb-4 text-sm text-admin-muted">
        Categories power both product assignment and the What We Create section.
        Edit here or via What We Create — same data.
      </p>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <DataTable
          rows={items}
          rowKey={(row) => idOf(row)}
          emptyMessage="No categories yet."
          columns={[
            {
              key: "name",
              header: "Name",
              render: (row) => (
                <Link
                  href={`/admin/what-we-create/${row._id}`}
                  className="font-medium hover:underline"
                >
                  {row.name}
                </Link>
              ),
            },
            {
              key: "slug",
              header: "Slug",
              render: (row) => (
                <span className="font-mono text-xs">{row.slug}</span>
              ),
            },
            {
              key: "order",
              header: "Order",
              render: (row) => row.displayOrder ?? 0,
            },
            {
              key: "active",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  status={row.active === false ? "inactive" : "active"}
                />
              ),
            },
          ]}
        />
      )}

      <div className="mt-4">
        <Link href="/admin/what-we-create" className="admin-btn-primary">
          <Plus className="h-4 w-4" /> Manage in What We Create
        </Link>
      </div>
    </>
  );
}
