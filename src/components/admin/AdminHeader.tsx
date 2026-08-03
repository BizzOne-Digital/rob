"use client";

import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export function AdminHeader({
  title,
  description,
  actions,
  onMenuClick,
}: AdminHeaderProps) {
  const { data } = useSession();

  return (
    <header className="no-print mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-1 rounded-md border border-admin-border bg-white p-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-admin-muted">{description}</p>
          ) : null}
          {data?.user?.email ? (
            <p className="mt-1 text-xs text-slate-400">
              Signed in as {data.user.email}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
