"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, DiscountAdmin } from "@/lib/admin/types";

export default function AdminDiscountsPage() {
  const [items, setItems] = useState<DiscountAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<DiscountAdmin>>(
        "/api/admin/discounts",
      );
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createDiscount() {
    if (!code.trim() || !value.trim()) {
      toast.error("Code and value are required");
      return;
    }
    setCreating(true);
    try {
      await adminFetch("/api/admin/discounts", {
        method: "POST",
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: Number(value),
          minSubtotal: minSubtotal ? Number(minSubtotal) : undefined,
          maxUses: maxUses ? Number(maxUses) : null,
          description: description || undefined,
          active,
        }),
      });
      toast.success("Discount created");
      setCode("");
      setValue("");
      setMinSubtotal("");
      setMaxUses("");
      setDescription("");
      setActive(true);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(item: DiscountAdmin) {
    try {
      await adminFetch("/api/admin/discounts", {
        method: "PATCH",
        body: JSON.stringify({ id: item._id, active: !item.active }),
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/discounts?id=${deleteId}`, {
        method: "DELETE",
      });
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="Discounts"
        description="Create and manage discount codes"
      />

      <section className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-3">
        <div>
          <label className="admin-label">Code</label>
          <input
            className="admin-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="admin-label">Type</label>
          <select
            className="admin-input"
            value={type}
            onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Value</label>
          <input
            className="admin-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Min subtotal</label>
          <input
            className="admin-input"
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Max uses</label>
          <input
            className="admin-input"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Description</label>
          <input
            className="admin-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active
        </label>
        <button
          type="button"
          className="admin-btn-primary"
          disabled={creating}
          onClick={() => void createDiscount()}
        >
          <Plus className="h-4 w-4" />
          Create code
        </button>
      </section>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <DataTable
          rows={items}
          rowKey={(row) => idOf(row)}
          emptyMessage="No discount codes yet."
          columns={[
            {
              key: "code",
              header: "Code",
              render: (row) => (
                <span className="font-mono font-medium">{row.code}</span>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (row) => row.type,
            },
            {
              key: "value",
              header: "Value",
              render: (row) =>
                row.type === "percentage" ? `${row.value}%` : `$${row.value}`,
            },
            {
              key: "uses",
              header: "Uses",
              render: (row) =>
                `${row.usedCount ?? 0}${row.maxUses != null ? ` / ${row.maxUses}` : ""}`,
            },
            {
              key: "active",
              header: "Status",
              render: (row) => (
                <StatusBadge status={row.active ? "active" : "inactive"} />
              ),
            },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleActive(row);
                    }}
                  >
                    {row.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-ghost text-rose-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(row._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete discount code?"
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
