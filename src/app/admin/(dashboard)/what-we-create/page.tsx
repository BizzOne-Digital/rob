"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type {
  AdminListResponse,
  CreationCategoryItem,
} from "@/lib/admin/types";

export default function WhatWeCreatePage() {
  const [items, setItems] = useState<CreationCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<CreationCategoryItem>>(
        "/api/admin/what-we-create",
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
        title="What We Create"
        description="Manage the six handmade creation categories (never labeled as Services)"
        actions={
          <button type="button" className="admin-btn-secondary" onClick={() => void load()}>
            Refresh
          </button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <DataTable
          rows={items}
          rowKey={(row) => idOf(row)}
          emptyMessage="No creation categories yet. Seed the six categories to get started."
          columns={[
            {
              key: "name",
              header: "Category",
              render: (row) => (
                <Link
                  href={`/admin/what-we-create/${row._id}`}
                  className="font-medium text-slate-900 hover:underline"
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
    </>
  );
}
