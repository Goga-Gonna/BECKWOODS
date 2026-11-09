"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, formatPrice, STATUS_LABEL } from "@/lib/format";

type Order = {
  id: string; number: string; status: string; deliveryMethod: string; email: string; fullName: string; phone: string;
  country: string; city: string; address: string; postalCode: string; comment: string;
  totalCents: number; currency: string; createdAt: string;
  items: { id: string; nameSnapshot: string; quantity: number; unitPriceCents: number }[];
};
const STATUSES = Object.keys(STATUS_LABEL);

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/orders${filter ? `?status=${filter}` : ""}`);
    const j = await r.json().catch(() => null);
    if (!r.ok) return setMsg(j?.error?.message ?? "Ошибка загрузки");
    setOrders(j.orders);
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s && STATUSES.includes(s)) setFilter(s);
  }, []);

  async function setStatus(id: string, status: string) {
    setMsg("");
    const r = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const j = await r.json().catch(() => null);
    setMsg(r.ok ? "Статус обновлён" : j?.error?.message ?? "Ошибка");
    load();
  }

  return (
    <>
      <h1 className="chrome-text font-display text-5xl font-bold uppercase tracking-tight">Заказы</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {["", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}
            className={`touch hairline px-3 font-mono text-[11px] uppercase tracking-[0.14em] ${filter === s ? "bg-bw-silver text-bw-black" : ""}`}>
            {s ? STATUS_LABEL[s] : "Все"}
          </button>
        ))}
      </div>
      {msg && <p role="status" className="meta mt-4">{msg}</p>}

      <ul className="mt-8 space-y-4">
        {orders?.map((o) => (
          <li key={o.id} className="hairline bg-bw-ink p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono">{o.number}</span> <span className="meta ml-2">{formatDate(o.createdAt)}</span>
                <span className="meta ml-2 bg-bw-graphite px-2 py-1 text-bw-chrome">
                  {o.deliveryMethod === "MEETING" ? "Встреча в Сумах" : "Доставка по Украине"}
                </span>
              </div>
              <label className="flex items-center gap-2">
                <span className="meta">Статус</span>
                <select className="field w-44" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} aria-label={`Статус заказа ${o.number}`}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 grid gap-1 text-sm text-bw-chrome sm:grid-cols-2">
              <div>{o.fullName} · {o.email} · {o.phone}</div>
              <div>{o.deliveryMethod === "MEETING" ? "Личная встреча в Сумах (детали в Telegram)" : `${o.postalCode}, ${o.country}, ${o.city}, ${o.address}`}</div>
              {o.comment && <div className="text-bw-mute sm:col-span-2">«{o.comment}»</div>}
            </div>
            <ul className="mt-3 space-y-1 border-t border-bw-steel pt-3 text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3"><span>{i.nameSnapshot} × {i.quantity}</span><span className="font-mono">{formatPrice(i.unitPriceCents * i.quantity, o.currency)}</span></li>
              ))}
            </ul>
            <div className="mt-3 text-right font-display text-xl font-bold">{formatPrice(o.totalCents, o.currency)}</div>
          </li>
        ))}
      </ul>
      {orders && orders.length === 0 && <p className="mt-8 text-bw-mute">Заказов нет.</p>}
    </>
  );
}
