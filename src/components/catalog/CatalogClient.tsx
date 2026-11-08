"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { ProductDTO } from "./types";
import { Button } from "@/components/ui/Button";
import { IconClose, IconFilter, IconSearch } from "@/components/ui/Icons";

type Category = { id: string; slug: string; name: string };
type Resp = { items: ProductDTO[]; total: number; page: number; pages: number; categories: Category[] };

const SORTS = [
  ["new", "Новинки"],
  ["price-asc", "Цена ↑"],
  ["price-desc", "Цена ↓"],
  ["name", "По названию"],
];

export function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "new";
  const inStock = sp.get("inStock") === "1";
  const min = sp.get("min") ?? "";
  const max = sp.get("max") ?? "";
  const page = Number(sp.get("page")) || 1;

  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(false);
  const [qInput, setQInput] = useState(q);
  const cats = useRef<Category[]>([]);

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      if (!("page" in patch)) next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname],
  );

  // Поиск с задержкой
  useEffect(() => setQInput(q), [q]);
  useEffect(() => {
    if (qInput === q) return;
    const t = setTimeout(() => setParams({ q: qInput.trim() || null }), 350);
    return () => clearTimeout(t);
  }, [qInput, q, setParams]);

  // Загрузка
  const qs = sp.toString();
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/products?${qs}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error?.message ?? "Ошибка загрузки");
        return r.json() as Promise<Resp>;
      })
      .then((d) => {
        cats.current = d.categories;
        setData(d);
      })
      .catch((e) => e.name !== "AbortError" && setError(e.message || "Не удалось загрузить каталог"))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [qs]);

  const categories = data?.categories ?? cats.current;
  const activeFilters = [category, inStock ? "1" : "", min, max].filter(Boolean).length;

  const Filters = (
    <div className="space-y-8">
      <div>
        <div className="meta mb-3">Категория</div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => setParams({ category: null })}>Все</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={category === c.slug} onClick={() => setParams({ category: c.slug })}>
              {c.name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <div className="meta mb-3">Цена, $</div>
        <div className="grid grid-cols-2 gap-2">
          <input className="field" inputMode="numeric" placeholder="от" aria-label="Цена от" value={min} onChange={(e) => setParams({ min: e.target.value.replace(/\D/g, "") })} />
          <input className="field" inputMode="numeric" placeholder="до" aria-label="Цена до" value={max} onChange={(e) => setParams({ max: e.target.value.replace(/\D/g, "") })} />
        </div>
      </div>
      <label className="touch flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={inStock} onChange={(e) => setParams({ inStock: e.target.checked ? "1" : null })} className="h-5 w-5 accent-[#c9cdd2]" />
        <span className="text-sm">Только в наличии</span>
      </label>
      {activeFilters > 0 && (
        <Button variant="ghost" className="w-full" onClick={() => setParams({ category: null, inStock: null, min: null, max: null })}>
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ Catalog</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.6rem,11vw,8rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">
        Каталог
      </h1>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">Поиск товаров</span>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bw-mute" />
          <input className="field pl-12" type="search" placeholder="Поиск товаров" value={qInput} maxLength={80} onChange={(e) => setQInput(e.target.value)} />
        </label>
        <div className="flex gap-3">
          <label className="relative flex-1 sm:w-48 sm:flex-none">
            <span className="sr-only">Сортировка</span>
            <select className="field appearance-none pr-8" value={sort} onChange={(e) => setParams({ sort: e.target.value === "new" ? null : e.target.value })}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <button onClick={() => setSheet(true)} className="touch hairline flex items-center gap-2 px-4 lg:hidden" aria-label="Фильтры">
            <IconFilter />
            {activeFilters > 0 && <span className="font-mono text-xs">{activeFilters}</span>}
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Фильтры">{Filters}</aside>

        <section aria-live="polite" aria-busy={loading}>
          <div className="meta mb-5">{data ? `${data.total} ${plural(data.total)}` : " "}</div>

          {error ? (
            <div role="alert" className="hairline p-6">
              <p>{error}</p>
              <Button variant="ghost" className="mt-4" onClick={() => router.refresh()}>Повторить</Button>
            </div>
          ) : loading && !data ? (
            <Skeleton />
          ) : data && data.items.length === 0 ? (
            <div className="hairline p-10 text-center text-bw-mute">Ничего не найдено. Измените запрос или фильтры.</div>
          ) : (
            <ul className={clsx("grid grid-cols-1 gap-x-3 gap-y-8 xs:grid-cols-2 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 transition-opacity", loading && "opacity-50")}>
              {data?.items.map((p, i) => (
                <li key={p.id} className="min-w-0"><ProductCard product={p} index={i} priority={i < 2} /></li>
              ))}
            </ul>
          )}

          {data && data.pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Страницы">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} aria-current={n === page ? "page" : undefined} onClick={() => setParams({ page: String(n) })}
                  className={clsx("touch hairline font-mono text-sm", n === page && "bg-bw-silver text-bw-black")}>
                  {n}
                </button>
              ))}
            </nav>
          )}
        </section>
      </div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-[80] bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              role="dialog" aria-modal="true" aria-label="Фильтры"
              className="fixed inset-x-0 bottom-0 z-[81] max-h-[85dvh] overflow-y-auto border-t border-bw-steel bg-bw-ink p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase">Фильтры</h2>
                <button aria-label="Закрыть" className="touch -mr-3 flex items-center justify-center" onClick={() => setSheet(false)}><IconClose /></button>
              </div>
              {Filters}
              <Button className="mt-8 w-full" onClick={() => setSheet(false)}>Показать {data?.total ?? ""}</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={clsx("touch hairline px-4 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors", active ? "bg-bw-silver text-bw-black" : "hover:border-bw-chrome")}>
      {children}
    </button>
  );
}

function Skeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="aspect-[4/5] animate-pulse bg-bw-graphite" />
      ))}
    </ul>
  );
}

function plural(n: number) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "товар";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "товара";
  return "товаров";
}
