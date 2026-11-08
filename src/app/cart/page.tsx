"use client";

import { cartCount, cartTotal, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/device";
import { formatPrice } from "@/lib/format";
import { CartLines } from "@/components/cart/CartLines";
import { ButtonLink } from "@/components/ui/Button";

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const count = hydrated ? cartCount(items) : 0;
  const total = hydrated ? cartTotal(items) : 0;

  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ Cart</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.6rem,11vw,8rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">Корзина</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>{hydrated ? <CartLines /> : null}</div>
        <aside className="hairline h-fit self-start bg-bw-ink p-6 lg:sticky lg:top-28">
          <div className="flex justify-between"><span className="meta">Товаров</span><span className="font-mono text-sm">{count}</span></div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="meta">Итого</span>
            <span className="font-display text-3xl font-bold">{formatPrice(total)}</span>
          </div>
          <p className="mt-3 text-xs text-bw-mute">Доставка рассчитывается при оформлении. Оплата отключена (демо-режим).</p>
          <div className="mt-6 grid gap-2">
            <ButtonLink href="/checkout" className={count ? "" : "pointer-events-none opacity-40"}>Оформить заказ</ButtonLink>
            <ButtonLink href="/catalog" variant="ghost">Продолжить покупки</ButtonLink>
            {count > 0 && <button onClick={clear} className="meta touch mt-1 hover:text-bw-silver">Очистить корзину</button>}
          </div>
        </aside>
      </div>
    </div>
  );
}
