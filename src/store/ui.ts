"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  /** null = авто-определение, true/false = выбор пользователя */
  liteOverride: boolean | null;
  setCartOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setLiteOverride: (v: boolean | null) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      cartOpen: false,
      menuOpen: false,
      searchOpen: false,
      liteOverride: null,
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setLiteOverride: (liteOverride) => set({ liteOverride }),
    }),
    {
      name: "bw-ui",
      partialize: (s) => ({ liteOverride: s.liteOverride }),
    },
  ),
);
