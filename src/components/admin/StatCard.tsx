"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <div className={cn("admin-card p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="rounded-lg bg-admin-accent-soft p-2 text-slate-700">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
