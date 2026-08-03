"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { X } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminCustomer, AdminListResponse } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
      });
      if (q.trim()) params.set("q", q.trim());
      const data = await adminFetch<AdminListResponse<AdminCustomer>>(
        `/api/admin/customers?${params.toString()}`,
      );
      setItems(data.items);
      setTotal(data.total ?? data.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveCustomer() {
    if (!editing) return;
    setSaving(true);
    try {
      await adminFetch("/api/admin/customers", {
        method: "PATCH",
        body: JSON.stringify({
          id: editing._id,
          name: name || null,
          phone: phone || null,
          notes: notes || null,
        }),
      });
      toast.success("Customer updated");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="Customers"
        description="Customer records from checkout and accounts"
      />

      <div className="mb-4">
        <input
          className="admin-input max-w-sm"
          placeholder="Search email, name, phone…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
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
            emptyMessage="No customers yet."
            columns={[
              {
                key: "email",
                header: "Email",
                render: (row) => row.email,
              },
              {
                key: "name",
                header: "Name",
                render: (row) => row.name || "—",
              },
              {
                key: "phone",
                header: "Phone",
                render: (row) => row.phone || "—",
              },
              {
                key: "orders",
                header: "Orders",
                render: (row) => row.orderCount ?? 0,
              },
              {
                key: "spent",
                header: "Total spent",
                render: (row) => formatCurrency(row.totalSpent ?? 0),
              },
              {
                key: "updated",
                header: "Updated",
                render: (row) =>
                  row.updatedAt
                    ? format(parseISO(row.updatedAt), "MMM d, yyyy")
                    : "—",
              },
              {
                key: "actions",
                header: "",
                render: (row) => (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(row);
                      setName(row.name ?? "");
                      setPhone(row.phone ?? "");
                      setNotes(row.notes ?? "");
                    }}
                  >
                    Edit
                  </button>
                ),
              },
            ]}
          />
          <div className="mt-4 flex justify-between text-sm text-admin-muted">
            <span>{total} customers</span>
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

      {editing ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close"
            onClick={() => setEditing(null)}
          />
          <div className="relative w-full max-w-md rounded-xl border bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Edit customer</h2>
                <p className="text-xs text-admin-muted">{editing.email}</p>
              </div>
              <button
                type="button"
                className="admin-btn-ghost"
                onClick={() => setEditing(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="admin-label">Name</label>
                <input
                  className="admin-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Phone</label>
                <input
                  className="admin-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Notes</label>
                <textarea
                  className="admin-input min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={saving}
                onClick={() => void saveCustomer()}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
