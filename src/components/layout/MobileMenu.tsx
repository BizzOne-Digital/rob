"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "What We Create", href: "/what-we-create" },
  { label: "Contact", href: "/contact" },
];

export function MobileMenu({
  open,
  onClose,
  showBlog,
}: {
  open: boolean;
  onClose: () => void;
  showBlog?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] bg-warm-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-soft-beige px-5 py-4">
              <p className="font-serif text-xl">{BRAND.name}</p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-powder-blue/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-8">
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block py-3 font-serif text-3xl text-charcoal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {showBlog ? (
                  <li>
                    <Link
                      href="/blog"
                      onClick={onClose}
                      className="block py-3 font-serif text-3xl text-charcoal"
                    >
                      Journal
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>
            <div className="border-t border-soft-beige p-5">
              <Button href="/contact" className="w-full" onClick={onClose}>
                Get in touch
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
