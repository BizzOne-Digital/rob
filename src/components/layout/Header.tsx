"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

export function Header({ showBlog = false }: { showBlog?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
          "sticky top-0 z-50 border-b border-[#aeb6a6]/60 bg-sage transition-shadow duration-300",
          scrolled && "shadow-[0_8px_30px_rgba(47,42,38,0.08)]",
        )}
      >
        <div className="relative mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-2 px-3 sm:h-[68px] sm:gap-3 sm:px-6 lg:h-[76px] lg:px-8">
          <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-[#2f2a26] transition hover:bg-white/25 lg:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandLogo size="sm" href="/" className="lg:hidden" />
            <BrandLogo size="md" href="/" className="hidden lg:inline-flex" />
          </div>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <NavLink href="/what-we-create">What We Create</NavLink>
            {showBlog ? <NavLink href="/blog">Journal</NavLink> : null}
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </IconButton>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="touch-target hidden items-center justify-center rounded-lg p-2 text-[#2f2a26] transition hover:bg-white/25 sm:inline-flex"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              aria-label="Open cart"
              className="touch-target relative inline-flex items-center justify-center rounded-lg p-2 text-[#2f2a26] transition hover:bg-white/25"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-taupe px-1 text-[10px] font-semibold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </button>
            <Link
              href="/what-we-create"
              className="ml-1 hidden h-9 items-center justify-center rounded-full bg-taupe px-4 text-[12px] font-semibold !text-white shadow-sm transition hover:bg-taupe-deep md:inline-flex"
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
      className="px-3 py-1.5 text-[13px] font-medium text-[#2f2a26] transition hover:text-taupe"
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
      className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-[#2f2a26] transition hover:bg-white/25"
    >
      {children}
    </button>
  );
}
