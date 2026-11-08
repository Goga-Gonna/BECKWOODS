"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image?: string;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => boolean;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) => {
        if (item.stock <= 0) return false;
        const existing = get().items.find((i) => i.productId === item.productId);
        const next = Math.min(item.stock, (existing?.quantity ?? 0) + qty, 20);
        set({
          items: existing
            ? get().items.map((i) =>
                i.productId === item.productId ? { ...i, ...item, quantity: next } : i,
              )
            : [...get().items, { ...item, quantity: next }],
        });
        return true;
      },
      setQty: (productId, qty) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(0, Math.min(i.stock, 20, qty)) } : i,
            )
            .filter((i) => i.quantity > 0),
        }),
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    { name: "bw-cart", version: 1 },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity * i.priceCents, 0);
