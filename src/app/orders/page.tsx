"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatDate, formatPrice, STATUS_LABEL } from "@/lib/format";

type Order = {
  number: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: { nameSnapshot: string; quantity: number; unitPriceCents: number }[];
};

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setEmail(localStorage.getItem("bw-last-email") ?? "");
    } catch { /* ignore */ }
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch(`/api/orders?email=${encodeURIComponent(email)}&number=${encodeURIComponent(number)}`);
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setError(j?.error?.message ?? "Ошибка запроса");
        setOrders(null);
        return;
      }
      setOrders(j.orders);
      if (!j.orders.length) setError("Заказ с такими данными не найден");
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ Orders</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.4rem,10vw,7rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">Мои заказы</h1>
      <p className="mt-4 max-w-lg text-bw-mute">Введите email и номер любого вашего заказа (BW-XXXXXXXX), чтобы увидеть историю.</p>

      <form onSubmit={search} className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input className="field" type="email" required placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input className="field uppercase" required placeholder="BW-XXXXXXXX" aria-label="Номер заказа" value={number} onChange={(e) => setNumber(e.target.value)} />
        <Button type="submit" disabled={busy}>{busy ? "…" : "Найти"}</Button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-bw-ice">{error}</p>}

      {orders && orders.length > 0 && (
        <ul className="mt-10 space-y-4">
          {orders.map((o) => (
            <li key={o.number} className="hairline bg-bw-ink p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono">{o.number}</span>
                <span className="meta bg-bw-graphite px-2 py-1 text-bw-chrome">{STATUS_LABEL[o.status] ?? o.status}</span>
              </div>
              <div className="meta mt-1">{formatDate(o.createdAt)}</div>
              <ul className="mt-4 space-y-1 text-sm">
                {o.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{i.nameSnapshot} × {i.quantity}</span>
                    <span className="font-mono">{formatPrice(i.unitPriceCents * i.quantity, o.currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-bw-steel pt-3">
                <span className="meta">Итого</span>
                <span className="font-display text-xl font-bold">{formatPrice(o.totalCents, o.currency)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
