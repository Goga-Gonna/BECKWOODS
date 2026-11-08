"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

type P = { id: string; slug: string; name: string; priceCents: number; stock: number; active: boolean; category: { name: string } };

export default function AdminProducts() {
  const [items, setItems] = useState<P[] | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/products");
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message);
      setItems(j.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function patch(id: string, data: Record<string, unknown>) {
    setMsg("");
    const r = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => null);
    if (!r.ok) { setMsg(j?.error?.message ?? "Не удалось сохранить"); return; }
    setMsg("Сохранено");
    load();
  }

  async function del(p: P) {
    if (!confirm(`Удалить «${p.name}»? Если товар есть в заказах, он будет скрыт.`)) return;
    const r = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    const j = await r.json().catch(() => null);
    setMsg(r.ok ? (j?.archived ? "Товар скрыт (есть в заказах)" : "Удалено") : j?.error?.message ?? "Ошибка");
    load();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="chrome-text font-display text-5xl font-bold uppercase tracking-tight">Товары</h1>
        <ButtonLink href="/admin/products/new">+ Новый товар</ButtonLink>
      </div>
      {msg && <p role="status" className="meta mt-4">{msg}</p>}
      {error && <p role="alert" className="mt-4 text-bw-ice">{error}</p>}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="meta border-b border-bw-steel">
            <tr><th className="py-3">Название</th><th>Категория</th><th>Цена, $</th><th>Остаток</th><th>Активен</th><th /></tr>
          </thead>
          <tbody>
            {items?.map((p) => (
              <tr key={p.id} className="border-b border-bw-steel align-middle">
                <td className="py-3 pr-3"><Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link><div className="meta">{p.slug}</div></td>
                <td className="pr-3 text-bw-mute">{p.category.name}</td>
                <td className="pr-3"><Inline value={(p.priceCents / 100).toString()} label={`Цена ${p.name}`} step="0.01" onSave={(v) => patch(p.id, { priceCents: Math.round(parseFloat(v) * 100) })} /><span className="sr-only">{formatPrice(p.priceCents)}</span></td>
                <td className="pr-3"><Inline value={String(p.stock)} label={`Остаток ${p.name}`} step="1" onSave={(v) => patch(p.id, { stock: parseInt(v, 10) })} /></td>
                <td className="pr-3"><input type="checkbox" aria-label={`Активен: ${p.name}`} checked={p.active} onChange={(e) => patch(p.id, { active: e.target.checked })} className="h-5 w-5 accent-[#c9cdd2]" /></td>
                <td className="text-right"><button onClick={() => del(p)} className="meta touch hover:text-bw-ice">Удалить</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items && items.length === 0 && <p className="py-8 text-bw-mute">Товаров нет.</p>}
      </div>
    </>
  );
}

function Inline({ value, label, step, onSave }: { value: string; label: string; step: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const valid = v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0;
  return (
    <input
      className="field w-24 px-2"
      type="number" min="0" step={step} inputMode="decimal" aria-label={label}
      value={v} onChange={(e) => setV(e.target.value)}
      onBlur={() => valid && v !== value && onSave(v)}
      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
    />
  );
}
