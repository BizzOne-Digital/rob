"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch } from "@/lib/admin/api";
import type {
  AdminCustomRequest,
  AdminItemResponse,
} from "@/lib/admin/types";

const STATUSES = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "completed",
] as const;

export default function CustomRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<AdminCustomRequest | null>(null);
  const [status, setStatus] = useState<AdminCustomRequest["status"]>("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminItemResponse<AdminCustomRequest>>(
        `/api/admin/custom-requests/${params.id}`,
      );
      setItem(data.item);
      setStatus(data.item.status);
      setAdminNotes(data.item.adminNotes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const data = await adminFetch<AdminItemResponse<AdminCustomRequest>>(
        `/api/admin/custom-requests/${params.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            adminNotes: adminNotes || null,
          }),
        },
      );
      setItem(data.item);
      toast.success("Request updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Custom request" />
        <LoadingState />
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <AdminHeader title="Custom request" />
        <ErrorState message={error || "Not found"} onRetry={() => void load()} />
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title={item.name}
        description={item.creationType}
        actions={
          <>
            <Link href="/admin/custom-requests" className="admin-btn-secondary">
              Back
            </Link>
            <button
              type="button"
              className="admin-btn-primary"
              disabled={saving}
              onClick={() => void save()}
            >
              Save
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="admin-card space-y-3 p-4 lg:col-span-2">
          <p className="text-sm text-slate-700">
            <strong>Email:</strong> {item.email}
            {item.phone ? (
              <>
                <br />
                <strong>Phone:</strong> {item.phone}
              </>
            ) : null}
          </p>
          <div>
            <h2 className="text-sm font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {item.description}
            </p>
          </div>
          {item.occasion ? (
            <p className="text-sm">
              <strong>Occasion:</strong> {item.occasion}
            </p>
          ) : null}
          {item.preferredWording ? (
            <p className="text-sm">
              <strong>Preferred wording:</strong> {item.preferredWording}
            </p>
          ) : null}
          {item.colours ? (
            <p className="text-sm">
              <strong>Colours:</strong> {item.colours}
            </p>
          ) : null}
          {item.quantity != null ? (
            <p className="text-sm">
              <strong>Quantity:</strong> {item.quantity}
            </p>
          ) : null}
          {item.budgetRange ? (
            <p className="text-sm">
              <strong>Budget:</strong> {item.budgetRange}
            </p>
          ) : null}
          {item.neededBy ? (
            <p className="text-sm">
              <strong>Needed by:</strong>{" "}
              {format(parseISO(item.neededBy), "MMM d, yyyy")}
            </p>
          ) : null}
          {item.additionalNotes ? (
            <div>
              <h2 className="text-sm font-semibold">Additional notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {item.additionalNotes}
              </p>
            </div>
          ) : null}
          {item.referenceImages?.length ? (
            <div>
              <h2 className="text-sm font-semibold">Reference images</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.referenceImages.map((img) => (
                  <a
                    key={img.url}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || "Reference"}
                      className="h-20 w-20 rounded border object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          <p className="text-xs text-admin-muted">
            Submitted{" "}
            {item.createdAt
              ? format(parseISO(item.createdAt), "MMM d, yyyy HH:mm")
              : ""}
          </p>
        </section>

        <section className="admin-card space-y-3 p-4">
          <div>
            <label className="admin-label">Status</label>
            <select
              className="admin-input"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AdminCustomRequest["status"])
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
              className="admin-input min-h-[120px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </section>
      </div>
    </>
  );
}
