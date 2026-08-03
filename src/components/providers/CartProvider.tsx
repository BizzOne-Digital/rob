"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  return <>{children}</>;
}
