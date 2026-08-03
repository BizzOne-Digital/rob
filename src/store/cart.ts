"use client";

import { create } from "zustand";

export interface CartLine {
  _id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug?: string;
  image?: string;
  price: number;
  quantity: number;
  variantLabel?: string;
  personalization?: Array<{
    fieldId: string;
    label: string;
    value: string;
    fileUrl?: string;
  }>;
  personalizable?: boolean;
}

export interface CartState {
  items: CartLine[];
  loading: boolean;
  open: boolean;
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  fetchCart: () => Promise<void>;
  addItem: (payload: {
    productId: string;
    variantId?: string;
    quantity?: number;
    personalization?: CartLine["personalization"];
  }) => Promise<{ ok: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

function normalizeCart(cart: { items?: CartLine[] } | null | undefined) {
  const items = (cart?.items ?? []).map((item) => ({
    ...item,
    _id: String(item._id),
    productId: String(item.productId),
  }));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { items, itemCount, subtotal };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  open: false,
  hydrated: false,
  itemCount: 0,
  subtotal: 0,

  setOpen: (open) => set({ open }),
  toggleOpen: () => set({ open: !get().open }),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      const data = await res.json();
      set({ ...normalizeCart(data.cart), hydrated: true, loading: false });
    } catch {
      set({ loading: false, hydrated: true });
    }
  },

  addItem: async (payload) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: payload.productId,
          variantId: payload.variantId,
          quantity: payload.quantity ?? 1,
          personalization: payload.personalization,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ loading: false });
        return { ok: false, error: data.error ?? "Could not add to cart" };
      }
      set({
        ...normalizeCart(data.cart),
        loading: false,
        open: true,
        hydrated: true,
      });
      return { ok: true };
    } catch {
      set({ loading: false });
      return { ok: false, error: "Could not add to cart" };
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      const data = await res.json();
      if (res.ok) set({ ...normalizeCart(data.cart), loading: false });
      else set({ loading: false });
    } catch {
      set({ loading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) set({ ...normalizeCart(data.cart), loading: false });
      else set({ loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart?clear=true", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) set({ ...normalizeCart(data.cart), loading: false });
      else set({ loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
