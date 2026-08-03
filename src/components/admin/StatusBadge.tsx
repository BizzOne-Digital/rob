"use client";

import { cn } from "@/lib/utils";

const TONE_MAP: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-amber-50 text-amber-800",
  new: "bg-sky-50 text-sky-700",
  read: "bg-slate-100 text-slate-600",
  replied: "bg-emerald-50 text-emerald-700",
  reviewing: "bg-indigo-50 text-indigo-700",
  quoted: "bg-violet-50 text-violet-700",
  accepted: "bg-emerald-50 text-emerald-700",
  declined: "bg-rose-50 text-rose-700",
  completed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-800",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  refunded: "bg-slate-100 text-slate-600",
  partially_refunded: "bg-amber-50 text-amber-800",
  pending_payment: "bg-amber-50 text-amber-800",
  confirmed: "bg-sky-50 text-sky-700",
  in_production: "bg-indigo-50 text-indigo-700",
  ready_for_pickup: "bg-cyan-50 text-cyan-800",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  show: "bg-emerald-50 text-emerald-700",
  contact: "bg-amber-50 text-amber-800",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  approved: "bg-emerald-50 text-emerald-700",
  unapproved: "bg-amber-50 text-amber-800",
  featured: "bg-violet-50 text-violet-700",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const tone = TONE_MAP[status] ?? "bg-slate-100 text-slate-700";
  const text = label ?? status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        tone,
        className,
      )}
    >
      {text}
    </span>
  );
}
