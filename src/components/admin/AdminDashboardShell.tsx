"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="admin-shell flex min-h-screen">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-64">
            <AdminSidebar />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="no-print flex items-center justify-between border-b border-admin-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>
          <Link href="/admin" className="text-sm font-semibold text-slate-900">
            RW Designs Admin
          </Link>
          <button
            type="button"
            className="admin-btn-ghost"
            onClick={() => router.refresh()}
          >
            Refresh
          </button>
        </div>
        <main className={cn("flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8")}>
          {children}
        </main>
      </div>
    </div>
  );
}
