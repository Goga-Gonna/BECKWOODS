"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { IconClose } from "@/components/ui/Icons";

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  if (!items.length) {
    return <p className="py-10 text-center text-bw-mute">Корзина пуста.</p>;
  }

  return (
    <ul className="divide-y divide-bw-steel">
      {items.map((i) => (
        <li key={i.productId} className="flex gap-4 py-4">
          <Link
            href={`/product/${i.slug}`}
            onClick={onNavigate}
            className="relative h-24 w-20 shrink-0 overflow-hidden bg-bw-graphite"
          >
            <ProductImage src={i.image} alt={i.name} sizes="80px" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/product/${i.slug}`} onClick={onNavigate} className="font-display text-base font-bold uppercase leading-tight tracking-tight">
                {i.name}
              </Link>
              <button
                aria-label={`Удалить ${i.name}`}
                onClick={() => remove(i.productId)}
                className="touch -mr-3 -mt-3 flex items-center justify-center text-bw-mute hover:text-bw-silver"
              >
                <IconClose width={18} height={18} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="hairline flex items-center">
                <button
                  aria-label="Меньше"
                  onClick={() => setQty(i.productId, i.quantity - 1)}
                  className="touch flex items-center justify-center hover:bg-bw-steel"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono text-sm" aria-live="polite">
                  {i.quantity}
                </span>
                <button
                  aria-label="Больше"
                  disabled={i.quantity >= Math.min(i.stock, 20)}
                  onClick={() => setQty(i.productId, i.quantity + 1)}
                  className="touch flex items-center justify-center hover:bg-bw-steel disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <span className="font-mono text-sm">{formatPrice(i.priceCents * i.quantity)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
