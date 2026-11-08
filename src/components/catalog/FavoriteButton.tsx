"use client";

import clsx from "clsx";
import { useFavorites } from "@/store/favorites";
import { useHydrated, haptic } from "@/lib/device";
import { IconHeart } from "@/components/ui/Icons";
import type { ProductDTO } from "./types";

export function FavoriteButton({ product, className }: { product: ProductDTO; className?: string }) {
  const hydrated = useHydrated();
  const active = useFavorites((s) => s.items.some((i) => i.productId === product.id));
  const toggle = useFavorites((s) => s.toggle);
  const on = hydrated && active;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Убрать из избранного" : "Добавить в избранное"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic(10);
        toggle({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          image: product.images[0],
          stock: product.stock,
        });
      }}
      className={clsx(
        "touch flex items-center justify-center transition-transform duration-300 ease-bw active:scale-90",
        on ? "text-bw-silver" : "text-bw-mute hover:text-bw-silver",
        className,
      )}
    >
      <IconHeart filled={on} />
    </button>
  );
}
