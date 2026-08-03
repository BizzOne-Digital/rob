"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, PricingRow } from "@/lib/admin/types";

interface EditableRow extends PricingRow {
  regularPriceInput: string;
  salePriceInput: string;
  costInput: string;
  priceVisibility: "show" | "contact";
}

function toEditable(row: PricingRow): EditableRow {
  return {
    ...row,
    regularPriceInput: row.regularPrice == null ? "" : String(row.regularPrice),
    salePriceInput: row.salePrice == null ? "" : String(row.salePrice),
    costInput: row.cost == null ? "" : String(row.cost),
    priceVisibility: row.priceVisibility ?? "contact",
  };
}

function parseNum(value: string): number | null {
  const t = value.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function AdminPricingPage() {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<PricingRow>>(
        "/api/admin/pricing",
      );
      const editable = data.items.map(toEditable);
      setRows(editable);
      setBaseline(JSON.stringify(editable));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(
    () => baseline !== "" && JSON.stringify(rows) !== baseline,
    [baseline, rows],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(term) ||
        (r.variantName ?? "").toLowerCase().includes(term) ||
        (r.sku ?? "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  async function saveAll() {
    setSaving(true);
    try {
      const items = rows.map((r) => ({
        id: idOf(r),
        regularPrice: parseNum(r.regularPriceInput),
        salePrice: parseNum(r.salePriceInput),
        cost: parseNum(r.costInput),
        priceVisibility: r.priceVisibility,
      }));
      await adminFetch("/api/admin/pricing", {
        method: "PATCH",
        body: JSON.stringify({ items }),
      });
      toast.success("Pricing saved");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateRow(id: string, patch: Partial<EditableRow>) {
    setRows((prev) =>
      prev.map((r) => (idOf(r) === id ? { ...r, ...patch } : r)),
    );
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <AdminHeader
        title="Pricing"
        description="Bulk edit regular, sale, cost, and contact/show visibility"
        actions={
          <button
            type="button"
            className="admin-btn-primary"
            disabled={saving || !dirty}
            onClick={() => void saveAll()}
          >
            {saving ? "Saving…" : "Bulk save"}
          </button>
        }
      />

      <div className="mb-4">
        <input
          className="admin-input max-w-sm"
          placeholder="Filter by product, variant, SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Variant</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Regular</th>
                  <th className="px-3 py-3">Sale</th>
                  <th className="px-3 py-3">Cost</th>
                  <th className="px-3 py-3">Visibility</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-admin-muted">
                      No pricing rows yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={idOf(row)} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{row.productName}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {row.variantName || "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {row.sku || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="admin-input w-24"
                          value={row.regularPriceInput}
                          onChange={(e) =>
                            updateRow(idOf(row), {
                              regularPriceInput: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="admin-input w-24"
                          value={row.salePriceInput}
                          onChange={(e) =>
                            updateRow(idOf(row), {
                              salePriceInput: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="admin-input w-24"
                          value={row.costInput}
                          onChange={(e) =>
                            updateRow(idOf(row), { costInput: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          className="admin-input w-36"
                          value={row.priceVisibility}
                          onChange={(e) =>
                            updateRow(idOf(row), {
                              priceVisibility: e.target.value as
                                | "show"
                                | "contact",
                            })
                          }
                        >
                          <option value="show">Show</option>
                          <option value="contact">Contact</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
