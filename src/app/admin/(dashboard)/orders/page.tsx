"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, AdminOrder } from "@/lib/admin/types";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
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
      if (fulfillmentStatus) params.set("fulfillmentStatus", fulfillmentStatus);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      const data = await adminFetch<AdminListResponse<AdminOrder>>(
        `/api/admin/orders?${params.toString()}`,
      );
      setItems(data.items);
      setTotal(data.total ?? data.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, q, fulfillmentStatus, paymentStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AdminHeader
        title="Orders"
        description="Filter and manage customer orders"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="admin-input max-w-xs"
          placeholder="Search order #, email, name…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          className="admin-input max-w-[200px]"
          value={fulfillmentStatus}
          onChange={(e) => {
            setPage(1);
            setFulfillmentStatus(e.target.value);
          }}
        >
          <option value="">All fulfillment</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="admin-input max-w-[180px]"
          value={paymentStatus}
          onChange={(e) => {
            setPage(1);
            setPaymentStatus(e.target.value);
          }}
        >
          <option value="">All payment</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially refunded</option>
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
            emptyMessage="No orders found."
            columns={[
              {
                key: "number",
                header: "Order",
                render: (row) => (
                  <Link
                    href={`/admin/orders/${row._id}`}
                    className="font-medium hover:underline"
                  >
                    {row.orderNumber}
                  </Link>
                ),
              },
              {
                key: "customer",
                header: "Customer",
                render: (row) => (
                  <div>
                    <div>{row.shippingAddress?.fullName || row.email}</div>
                    <div className="text-xs text-admin-muted">{row.email}</div>
                  </div>
                ),
              },
              {
                key: "total",
                header: "Total",
                render: (row) => formatCurrency(row.total, row.currency),
              },
              {
                key: "payment",
                header: "Payment",
                render: (row) => <StatusBadge status={row.paymentStatus} />,
              },
              {
                key: "fulfillment",
                header: "Fulfillment",
                render: (row) => <StatusBadge status={row.fulfillmentStatus} />,
              },
              {
                key: "date",
                header: "Date",
                render: (row) =>
                  row.createdAt
                    ? format(parseISO(row.createdAt), "MMM d, yyyy")
                    : "—",
              },
            ]}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-admin-muted">
            <span>{total} orders</span>
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
