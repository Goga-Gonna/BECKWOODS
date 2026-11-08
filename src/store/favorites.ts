"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FavItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image?: string;
  stock: number;
};

type FavState = {
  items: FavItem[];
  toggle: (item: FavItem) => void;
  has: (productId: string) => boolean;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set({
          items: get().items.some((i) => i.productId === item.productId)
            ? get().items.filter((i) => i.productId !== item.productId)
            : [...get().items, item],
        }),
      has: (id) => get().items.some((i) => i.productId === id),
    }),
    { name: "bw-favorites", version: 1 },
  ),
);
