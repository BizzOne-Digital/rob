"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type {
  AdminCustomRequest,
  AdminListResponse,
} from "@/lib/admin/types";

const STATUSES = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "completed",
] as const;

export default function CustomRequestsPage() {
  const [items, setItems] = useState<AdminCustomRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
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
      const data = await adminFetch<AdminListResponse<AdminCustomRequest>>(
        `/api/admin/custom-requests?${params.toString()}`,
      );
      setItems(data.items);
      setTotal(data.total ?? data.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AdminHeader
        title="Custom Requests"
        description="Review handmade custom creation requests"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="admin-input max-w-xs"
          placeholder="Search…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          className="admin-input max-w-[180px]"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
            emptyMessage="No custom requests."
            columns={[
              {
                key: "name",
                header: "Requester",
                render: (row) => (
                  <Link
                    href={`/admin/custom-requests/${row._id}`}
                    className="font-medium hover:underline"
                  >
                    {row.name}
                  </Link>
                ),
              },
              {
                key: "type",
                header: "Creation type",
                render: (row) => row.creationType,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "date",
                header: "Submitted",
                render: (row) =>
                  row.createdAt
                    ? format(parseISO(row.createdAt), "MMM d, yyyy")
                    : "—",
              },
            ]}
          />
          <div className="mt-4 flex justify-between text-sm text-admin-muted">
            <span>{total} requests</span>
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
