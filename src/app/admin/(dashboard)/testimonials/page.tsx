"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type {
  AdminListResponse,
  TestimonialAdmin,
} from "@/lib/admin/types";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<TestimonialAdmin>>(
        "/api/admin/testimonials",
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

  async function createItem() {
    if (!customerName.trim() || !reviewText.trim()) {
      toast.error("Name and review are required");
      return;
    }
    setCreating(true);
    try {
      await adminFetch("/api/admin/testimonials", {
        method: "POST",
        body: JSON.stringify({
          customerName: customerName.trim(),
          reviewText: reviewText.trim(),
          rating: Number(rating) || 5,
          approved: false,
          featured: false,
          displayOrder: items.length,
        }),
      });
      toast.success("Testimonial added (unapproved)");
      setCustomerName("");
      setReviewText("");
      setRating("5");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function patchItem(
    id: string,
    updates: Partial<{
      approved: boolean;
      featured: boolean;
      displayOrder: number;
    }>,
  ) {
    try {
      await adminFetch("/api/admin/testimonials", {
        method: "PATCH",
        body: JSON.stringify({ id, ...updates }),
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
      await adminFetch(`/api/admin/testimonials?id=${deleteId}`, {
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
        title="Testimonials"
        description="Approve, feature, and reorder reviews. New samples start unapproved."
      />

      <section className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Customer name</label>
          <input
            className="admin-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Rating</label>
          <select
            className="admin-input"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Review</label>
          <textarea
            className="admin-input min-h-[90px]"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          disabled={creating}
          onClick={() => void createItem()}
        >
          <Plus className="h-4 w-4" />
          Add unapproved sample
        </button>
      </section>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item._id} className="admin-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{item.customerName}</h3>
                    <StatusBadge
                      status={item.approved ? "approved" : "unapproved"}
                    />
                    {item.featured ? <StatusBadge status="featured" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.reviewText}</p>
                  {item.productName ? (
                    <p className="mt-1 text-xs text-admin-muted">
                      Product: {item.productName}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-admin-muted">Order</label>
                  <input
                    type="number"
                    className="admin-input w-20"
                    value={item.displayOrder ?? 0}
                    onBlur={(e) =>
                      void patchItem(item._id, {
                        displayOrder: Number(e.target.value) || 0,
                      })
                    }
                    onChange={(e) => {
                      const displayOrder = Number(e.target.value) || 0;
                      setItems((prev) =>
                        prev.map((row) =>
                          row._id === item._id ? { ...row, displayOrder } : row,
                        ),
                      );
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() =>
                      void patchItem(item._id, { approved: !item.approved })
                    }
                  >
                    {item.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() =>
                      void patchItem(item._id, { featured: !item.featured })
                    }
                  >
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-ghost text-rose-600"
                    onClick={() => setDeleteId(idOf(item))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete testimonial?"
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
