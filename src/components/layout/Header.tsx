"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { siteConfig } from "@config/site";
import { useUI } from "@/store/ui";
import { cartCount, useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useHydrated } from "@/lib/device";
import { IconBag, IconHeart, IconMenu, IconSearch } from "@/components/ui/Icons";

export function Header() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.items));
  const favCount = useFavorites((s) => s.items.length);
  const { setCartOpen, setMenuOpen, setSearchOpen } = useUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 pt-safe-top transition-[background,border-color] duration-500 ease-bw",
        scrolled ? "glass border-b border-bw-steel" : "border-b border-transparent",
      )}
    >
      <div className="container-bw flex h-14 items-center justify-between lg:h-[72px]">
        <Link href="/" aria-label={siteConfig.name} className="touch flex items-center">
          <span className="chrome-text font-display text-lg font-bold uppercase tracking-[-0.03em] lg:text-xl">
            {siteConfig.shortName}
          </span>
          <span className="meta ml-1 hidden xs:inline">.STORE</span>
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="meta relative py-2 text-bw-silver transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-bw-chrome after:transition-transform after:duration-500 after:ease-bw hover:after:scale-x-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <button aria-label="Поиск" onClick={() => setSearchOpen(true)} className="touch flex items-center justify-center">
            <IconSearch />
          </button>
          <Link href="/favorites" aria-label="Избранное" className="touch relative hidden items-center justify-center lg:flex">
            <IconHeart />
            {hydrated && favCount > 0 && <Badge n={favCount} />}
          </Link>
          <button aria-label={`Корзина, товаров: ${hydrated ? count : 0}`} onClick={() => setCartOpen(true)} className="touch relative flex items-center justify-center">
            <IconBag />
            {hydrated && count > 0 && <Badge n={count} />}
          </button>
          <button aria-label="Меню" onClick={() => setMenuOpen(true)} className="touch flex items-center justify-center lg:hidden">
            <IconMenu />
          </button>
        </div>
      </div>
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-bw-silver px-1 font-mono text-[10px] font-bold text-bw-black">
      {n}
    </span>
  );
}
