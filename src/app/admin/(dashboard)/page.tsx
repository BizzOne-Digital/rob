"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Inbox,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch } from "@/lib/admin/api";
import type { DashboardData } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<DashboardData>("/api/admin/dashboard");
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxTrend = useMemo(() => {
    if (!data?.salesTrend?.length) return 1;
    return Math.max(1, ...data.salesTrend.map((d) => d.total));
  }, [data]);

  const maxCategory = useMemo(() => {
    if (!data?.ordersByCategory?.length) return 1;
    return Math.max(1, ...data.ordersByCategory.map((d) => d.revenue));
  }, [data]);

  if (loading) {
    return (
      <>
        <AdminHeader title="Dashboard" description="Live store overview" />
        <LoadingState label="Loading dashboard…" />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <AdminHeader title="Dashboard" />
        <ErrorState message={error || "No data"} onRetry={() => void load()} />
      </>
    );
  }

  const { counts } = data;

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Real-time counts from your store data"
        actions={
          <button type="button" className="admin-btn-secondary" onClick={() => void load()}>
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sales total"
          value={formatCurrency(counts.salesTotal)}
          hint="Paid orders"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label="Orders"
          value={counts.orders}
          hint={`${counts.pendingOrders} pending · ${counts.inProduction} in production`}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          label="Products"
          value={counts.products}
          hint={`${counts.publishedProducts} published · ${counts.draftProducts} draft`}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          label="Needs attention"
          value={counts.customRequestsNew + counts.inquiriesNew + counts.lowStock}
          hint={`${counts.customRequestsNew} requests · ${counts.inquiriesNew} inquiries · ${counts.lowStock} low stock`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="admin-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Sales trend (14 days)</h2>
          <p className="mt-1 text-xs text-admin-muted">Paid order totals by day</p>
          {data.salesTrend.every((d) => d.total === 0) ? (
            <div className="mt-8">
              <EmptyState title="No paid sales yet" description="Trend will appear once orders are paid." />
            </div>
          ) : (
            <div className="mt-6">
              <svg viewBox="0 0 560 160" className="h-40 w-full" role="img" aria-label="Sales trend chart">
                <polyline
                  fill="none"
                  stroke="#7ba3c9"
                  strokeWidth="2.5"
                  points={data.salesTrend
                    .map((d, i) => {
                      const x = (i / Math.max(1, data.salesTrend.length - 1)) * 540 + 10;
                      const y = 140 - (d.total / maxTrend) * 120;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
                {data.salesTrend.map((d, i) => {
                  const x = (i / Math.max(1, data.salesTrend.length - 1)) * 540 + 10;
                  const y = 140 - (d.total / maxTrend) * 120;
                  return (
                    <circle key={d.date} cx={x} cy={y} r="3" fill="#141414">
                      <title>
                        {d.date}: {formatCurrency(d.total)} ({d.count} orders)
                      </title>
                    </circle>
                  );
                })}
              </svg>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>{data.salesTrend[0]?.date}</span>
                <span>{data.salesTrend[data.salesTrend.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </section>

        <section className="admin-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Orders by category</h2>
          <p className="mt-1 text-xs text-admin-muted">Paid item revenue by product category</p>
          {data.ordersByCategory.length === 0 ? (
            <div className="mt-8">
              <EmptyState title="No category sales yet" />
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {data.ordersByCategory.map((row) => (
                <li key={row._id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{row._id}</span>
                    <span className="tabular-nums text-slate-600">
                      {formatCurrency(row.revenue)} · {row.count} items
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-admin-accent"
                      style={{ width: `${(row.revenue / maxCategory) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-slate-600 hover:underline">
            View orders
          </Link>
        </div>
        {data.recentActivity.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Admin actions will appear here."
            action={
              <span className="inline-flex items-center gap-2 text-xs text-admin-muted">
                <Inbox className="h-3.5 w-3.5" /> Waiting for first actions
              </span>
            }
          />
        ) : (
          <ul className="divide-y divide-admin-border">
            {data.recentActivity.map((item) => (
              <li key={item._id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm text-slate-800">{item.summary}</p>
                  <p className="mt-0.5 text-xs text-admin-muted">
                    {item.action}
                    {item.actorEmail ? ` · ${item.actorEmail}` : ""}
                  </p>
                </div>
                {item.createdAt ? (
                  <time className="shrink-0 text-xs text-slate-400">
                    {format(parseISO(item.createdAt), "MMM d, HH:mm")}
                  </time>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
