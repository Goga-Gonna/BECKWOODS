"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { cartCount, useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useUI } from "@/store/ui";
import { useHydrated } from "@/lib/device";
import { IconBag, IconGrid, IconHeart, IconHome } from "@/components/ui/Icons";

/** Нижняя навигация только для мобильных (< lg). Учитывает safe-area iPhone. */
export function TabBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.items));
  const fav = useFavorites((s) => s.items.length);
  const setCartOpen = useUI((s) => s.setCartOpen);

  const tabs = [
    { href: "/", label: "Главная", icon: <IconHome />, active: pathname === "/" },
    { href: "/catalog", label: "Каталог", icon: <IconGrid />, active: pathname.startsWith("/catalog") || pathname.startsWith("/product") },
    { href: "/favorites", label: "Избранное", icon: <IconHeart />, active: pathname.startsWith("/favorites"), badge: fav },
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Нижняя навигация"
      className="glass fixed inset-x-0 bottom-0 z-50 border-t border-bw-steel pb-safe-bottom lg:hidden"
    >
      <ul className="grid h-[60px] grid-cols-4">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={clsx(
                "relative flex h-full flex-col items-center justify-center gap-0.5 transition-colors",
                t.active ? "text-bw-silver" : "text-bw-mute",
              )}
            >
              {t.icon}
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{t.label}</span>
              {hydrated && !!t.badge && (
                <span className="absolute right-[26%] top-2 flex h-4 min-w-4 items-center justify-center bg-bw-silver px-1 font-mono text-[9px] font-bold text-bw-black">
                  {t.badge}
                </span>
              )}
              {t.active && <span className="absolute inset-x-5 top-0 h-px bg-bw-chrome" />}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-bw-mute"
          >
            <IconBag />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em]">Корзина</span>
            {hydrated && count > 0 && (
              <span className="absolute right-[26%] top-2 flex h-4 min-w-4 items-center justify-center bg-bw-silver px-1 font-mono text-[9px] font-bold text-bw-black">
                {count}
              </span>
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
}
