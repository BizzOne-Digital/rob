"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, AdminPage } from "@/lib/admin/types";

export default function AdminPagesListPage() {
  const [items, setItems] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<AdminPage>>("/api/admin/pages");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
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
        title="Pages"
        description="Edit storefront page content section by section"
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
          emptyMessage="No pages found. Seed content or create pages via API."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (row) => (
                <Link
                  href={`/admin/pages/${row.slug}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {row.title}
                </Link>
              ),
            },
            {
              key: "path",
              header: "Path",
              render: (row) => (
                <span className="font-mono text-xs text-slate-600">{row.path}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "sections",
              header: "Sections",
              render: (row) => row.sections?.length ?? 0,
            },
            {
              key: "updated",
              header: "Updated",
              render: (row) =>
                row.updatedAt
                  ? format(parseISO(row.updatedAt), "MMM d, yyyy")
                  : "—",
            },
          ]}
        />
      )}
    </>
  );
}
