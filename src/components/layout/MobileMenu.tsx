"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@config/site";
import { useUI } from "@/store/ui";
import { IconClose } from "@/components/ui/Icons";
import { SocialOrbit } from "@/components/social/SocialOrbit";

const links = [{ href: "/", label: "Главная" }, ...siteConfig.nav, { href: "/orders", label: "Мои заказы" }, { href: "/favorites", label: "Избранное" }];

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          className="fixed inset-0 z-[75] flex flex-col bg-bw-black px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-safe-top lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex h-14 items-center justify-between">
            <span className="meta">{siteConfig.name}</span>
            <button aria-label="Закрыть меню" onClick={() => setOpen(false)} className="touch -mr-3 flex items-center justify-center">
              <IconClose />
            </button>
          </div>
          <nav className="mt-6 flex-1 overflow-y-auto">
            <ul>
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-bw-steel"
                >
                  <Link
                    href={l.href}
                    className="chrome-text flex min-h-[56px] items-center justify-between font-display text-[clamp(1.75rem,9vw,2.75rem)] font-bold uppercase tracking-[-0.03em]"
                  >
                    {l.label}
                    <span className="meta">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="pt-4">
            <SocialOrbit variant="dock" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
