"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Package,
  Tags,
  DollarSign,
  ShoppingBag,
  Users,
  MessageSquareHeart,
  Images,
  Quote,
  Newspaper,
  Inbox,
  TicketPercent,
  FolderOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/what-we-create", label: "What We Create", icon: Sparkles },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  {
    href: "/admin/custom-requests",
    label: "Custom Requests",
    icon: MessageSquareHeart,
  },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/blogs", label: "Blogs", icon: Newspaper },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/discounts", label: "Discounts", icon: TicketPercent },
  { href: "/admin/media", label: "Media Library", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print flex h-screen w-64 shrink-0 flex-col bg-admin-sidebar text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-admin-accent-soft/80">
          Admin
        </p>
        <p className="mt-1 text-lg font-semibold leading-tight">
          RW Designs Canada
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
