"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/store/ui";
import { IconClose, IconSearch } from "@/components/ui/Icons";

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => ref.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    setOpen(false);
    router.push(term ? `/catalog?q=${encodeURIComponent(term)}` : "/catalog");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Поиск"
          className="glass fixed inset-0 z-[78] bg-bw-black/90 px-4 pt-safe-top"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="container-bw mt-16 lg:mt-28">
            <div className="flex items-center gap-3 border-b border-bw-chrome/40 pb-3">
              <IconSearch />
              <input
                ref={ref}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по каталогу"
                aria-label="Поиск по каталогу"
                maxLength={80}
                className="min-h-[44px] w-full bg-transparent font-display text-2xl font-bold uppercase tracking-tight placeholder:text-bw-steel focus:outline-none sm:text-4xl"
              />
              <button type="button" aria-label="Закрыть поиск" onClick={() => setOpen(false)} className="touch flex items-center justify-center">
                <IconClose />
              </button>
            </div>
            <p className="meta mt-3">Enter — искать</p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
