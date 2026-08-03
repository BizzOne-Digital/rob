"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { CREATION_CATEGORIES, BRAND } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

export function Header({ showBlog = false }: { showBlog?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount);
  const setCartOpen = useCartStore((s) => s.setOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-[#e8e4ea]/80 bg-white transition-shadow duration-300",
          scrolled && "shadow-[0_8px_30px_rgba(20,20,20,0.06)]",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[78px] lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            className="rounded-lg p-2 text-[#3d3a40] hover:bg-[#f3eef3] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="relative z-10 shrink-0">
            <Image
              src="/images/brand/rw-designs-canada-logo.png"
              alt={BRAND.name}
              width={160}
              height={52}
              className="h-[42px] w-auto object-contain sm:h-[48px]"
              priority
            />
          </Link>

          {/* Center nav — desktop */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <div
              className="relative"
              onMouseEnter={() => setCreateOpen(true)}
              onMouseLeave={() => setCreateOpen(false)}
            >
              <Link
                href="/what-we-create"
                className="inline-flex items-center px-3 py-2 text-[14px] font-medium text-[#3d3a40] transition hover:text-[#9a7f92]"
              >
                What We Create
              </Link>
              {createOpen ? (
                <div className="absolute left-1/2 top-full z-50 w-[300px] -translate-x-1/2 pt-2">
                  <div className="overflow-hidden rounded-2xl border border-[#e8e4ea] bg-white p-2 shadow-[0_16px_40px_rgba(20,20,20,0.08)]">
                    <Link
                      href="/what-we-create"
                      className="block rounded-xl px-4 py-2.5 text-sm text-[#3d3a40]/70 transition hover:bg-[#f6f1f6]"
                    >
                      Overview
                    </Link>
                    {CREATION_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/what-we-create/${cat.slug}`}
                        className="block rounded-xl px-4 py-2.5 text-sm text-[#3d3a40] transition hover:bg-[#f6f1f6]"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/gallery">Gallery</NavLink>
            {showBlog ? <NavLink href="/blog">Journal</NavLink> : null}
            <NavLink href="/faq">FAQ</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </IconButton>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden rounded-lg p-2 text-[#3d3a40] transition hover:bg-[#f3eef3] sm:inline-flex"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              aria-label="Open cart"
              className="relative rounded-lg p-2 text-[#3d3a40] transition hover:bg-[#f3eef3]"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b08d9e] px-1 text-[10px] font-semibold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </button>
            <Link
              href="/shop"
              className="ml-1 hidden h-10 items-center justify-center rounded-xl bg-[#b08d9e] px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#9f7d8e] sm:inline-flex"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        showBlog={showBlog}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-[14px] font-medium text-[#3d3a40] transition hover:text-[#9a7f92]"
    >
      {children}
    </Link>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-lg p-2 text-[#3d3a40] transition hover:bg-[#f3eef3]"
    >
      {children}
    </button>
  );
}
