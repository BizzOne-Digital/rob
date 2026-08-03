"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, InquiryAdmin } from "@/lib/admin/types";

const STATUSES = ["new", "read", "replied", "archived"] as const;

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<InquiryAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<InquiryAdmin | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [editStatus, setEditStatus] = useState<InquiryAdmin["status"]>("new");
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
      if (status) params.set("status", status);
      const data = await adminFetch<AdminListResponse<InquiryAdmin>>(
        `/api/admin/inquiries?${params.toString()}`,
      );
      setItems(data.items);
      setTotal(data.total ?? data.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveInquiry() {
    if (!selected) return;
    setSaving(true);
    try {
      await adminFetch(`/api/admin/inquiries/${selected._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editStatus,
          adminNotes: adminNotes || null,
        }),
      });
      toast.success("Inquiry updated");
      setSelected(null);
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
        title="Inquiries"
        description="Contact form messages and status updates"
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
          className="admin-input max-w-[160px]"
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
            emptyMessage="No inquiries."
            columns={[
              {
                key: "name",
                header: "From",
                render: (row) => (
                  <button
                    type="button"
                    className="text-left font-medium hover:underline"
                    onClick={() => {
                      setSelected(row);
                      setEditStatus(row.status);
                      setAdminNotes(row.adminNotes ?? "");
                    }}
                  >
                    {row.name}
                  </button>
                ),
              },
              {
                key: "email",
                header: "Email",
                render: (row) => row.email,
              },
              {
                key: "type",
                header: "Type",
                render: (row) => row.type,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge status={row.status} />,
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
          <div className="mt-4 flex justify-between text-sm text-admin-muted">
            <span>{total} inquiries</span>
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

      {selected ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p className="text-sm text-admin-muted">
              {selected.email} · {selected.type}
            </p>
            {selected.subject ? (
              <p className="mt-3 text-sm font-medium">{selected.subject}</p>
            ) : null}
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {selected.message}
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="admin-label">Status</label>
                <select
                  className="admin-input"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as InquiryAdmin["status"])
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Admin notes</label>
                <textarea
                  className="admin-input min-h-[90px]"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={saving}
                onClick={() => void saveInquiry()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
