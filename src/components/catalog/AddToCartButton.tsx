"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { haptic } from "@/lib/device";
import { Button } from "@/components/ui/Button";
import type { ProductDTO } from "./types";

export function AddToCartButton({
  product,
  openCart = false,
  className,
  compact = false,
}: {
  product: ProductDTO;
  openCart?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [done, setDone] = useState(false);
  const out = product.stock <= 0;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <Button
      disabled={out}
      variant={out ? "dark" : "chrome"}
      className={className}
      aria-live="polite"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          image: product.images[0],
          stock: product.stock,
        });
        if (ok) {
          haptic(15);
          setDone(true);
          if (openCart) setCartOpen(true);
        }
      }}
    >
      {out ? "Нет в наличии" : done ? "Добавлено ✓" : compact ? "В корзину" : "Добавить в корзину"}
    </Button>
  );
}
