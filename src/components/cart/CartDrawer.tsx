"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/store/ui";
import { cartCount, cartTotal, useCart } from "@/store/cart";
import { useHydrated, useIsMobile } from "@/lib/device";
import { formatPrice } from "@/lib/format";
import { CartLines } from "./CartLines";
import { ButtonLink } from "@/components/ui/Button";
import { IconClose } from "@/components/ui/Icons";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const mobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, setOpen]);

  const count = hydrated ? cartCount(items) : 0;
  const total = hydrated ? cartTotal(items) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            className="fixed inset-0 z-[80] bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            className="glass hairline fixed z-[81] flex flex-col bg-bw-ink max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[88dvh] max-md:rounded-none md:inset-y-0 md:right-0 md:w-[440px]"
            initial={mobile ? { y: "100%" } : { x: "100%" }}
            animate={mobile ? { y: 0 } : { x: 0 }}
            exit={mobile ? { y: "100%" } : { x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag={mobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && setOpen(false)}
          >
            {mobile && <div className="mx-auto mt-2 h-1 w-10 bg-bw-steel" aria-hidden />}
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                Корзина <span className="meta align-middle">({count})</span>
              </h2>
              <button aria-label="Закрыть" onClick={() => setOpen(false)} className="touch -mr-3 flex items-center justify-center">
                <IconClose />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5">
              <CartLines onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-bw-steel px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="meta">Итого</span>
                <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              <div className="grid gap-2">
                <ButtonLink href="/checkout" className={count ? "" : "pointer-events-none opacity-40"}>
                  Оформить заказ
                </ButtonLink>
                <ButtonLink href="/cart" variant="ghost">
                  Открыть корзину
                </ButtonLink>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
