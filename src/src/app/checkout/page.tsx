"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { siteConfig } from "@config/site";
import { cartTotal, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/device";
import { formatPrice } from "@/lib/format";
import { orderInput } from "@/lib/validation";
import { buildMeetingMessage, managerLink } from "@/lib/telegram";
import { Button, ButtonLink } from "@/components/ui/Button";

type Method = "DELIVERY" | "MEETING";
type Errors = Record<string, string[] | undefined>;
type Done = { number: string; totalCents: number; method: Method; tgUrl: string };

const manager = siteConfig.contacts.manager;

const empty = { email: "", fullName: "", phone: "", country: "Украина", city: "", address: "", postalCode: "", comment: "" };
type Key = keyof typeof empty;

const METHODS: { id: Method; title: string; text: string }[] = [
  {
    id: "MEETING",
    title: "Встреча в Сумах",
    text: `Личная встреча. После оформления откроется Telegram менеджера ${manager.handle} с готовым сообщением.`,
  },
  { id: "DELIVERY", title: "Доставка по Украине", text: "Срок доставки 1–2 дня." },
];

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [method, setMethod] = useState<Method | null>(null);
  const [form, setForm] = useState(empty);
  const [age, setAge] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const total = cartTotal(items);
  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // После оформления «встречи» переносим покупателя в Telegram менеджера (кнопка остаётся запасным вариантом)
  useEffect(() => {
    if (!done || done.method !== "MEETING") return;
    const t = setTimeout(() => {
      window.location.href = done.tgUrl;
    }, 2000);
    return () => clearTimeout(t);
  }, [done]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!method) {
      setFormError("Выберите способ получения");
      return;
    }

    const common = {
      email: form.email,
      fullName: form.fullName,
      phone: form.phone,
      comment: form.comment,
      ageConfirmed: age,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };
    const payload =
      method === "MEETING"
        ? { ...common, deliveryMethod: "MEETING" as const }
        : {
            ...common,
            deliveryMethod: "DELIVERY" as const,
            country: form.country,
            city: form.city,
            address: form.address,
            postalCode: form.postalCode,
          };

    const parsed = orderInput.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as unknown as Errors);
      setFormError("Проверьте выделенные поля");
      return;
    }
    setErrors({});
    setBusy(true);
    const snapshot = items.map((i) => ({ name: i.name, quantity: i.quantity, priceCents: i.priceCents }));

    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        if (json?.error?.details && typeof json.error.details === "object") setErrors(json.error.details);
        setFormError(json?.error?.message ?? "Не удалось оформить заказ");
        return;
      }
      try {
        localStorage.setItem("bw-last-email", parsed.data.email);
      } catch {
        /* ignore */
      }

      const number: string = json.order.number;
      const totalCents: number = json.order.totalCents;
      const tgUrl =
        method === "MEETING"
          ? managerLink(
              buildMeetingMessage({
                number,
                fullName: parsed.data.fullName,
                phone: parsed.data.phone,
                items: snapshot,
                totalCents,
              }),
            )
          : managerLink();

      setDone({ number, totalCents, method, tgUrl });
      clear();
    } catch {
      setFormError("Нет соединения с сервером. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const meeting = done.method === "MEETING";
    return (
      <div className="container-bw py-16 text-center">
        <p className="meta">/ Order received</p>
        <h1 className="chrome-text mt-4 font-display text-[clamp(2.2rem,9vw,6rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em]">
          Заказ принят
        </h1>
        <p className="mt-6 font-mono text-lg">{done.number}</p>
        <p className="mx-auto mt-4 max-w-md text-bw-mute">
          Сумма {formatPrice(done.totalCents)}.{" "}
          {meeting
            ? `Сейчас откроется Telegram менеджера ${manager.handle} с готовым сообщением: отправьте его, чтобы согласовать время и место встречи в Сумах.`
            : "Онлайн-оплата на сайте не производится: детали заказа подтвердит менеджер."}{" "}
          Сохраните номер заказа — по нему и email заказ можно найти в истории.
        </p>
        <div className="mx-auto mt-8 grid max-w-sm gap-2">
          {meeting ? (
            <ButtonLink href={done.tgUrl} external>
              Открыть Telegram
            </ButtonLink>
          ) : (
            <ButtonLink href={done.tgUrl} external variant="ghost">
              Написать менеджеру {manager.handle}
            </ButtonLink>
          )}
          <ButtonLink href="/orders" variant="ghost">История заказов</ButtonLink>
          <ButtonLink href="/catalog" variant="ghost">В каталог</ButtonLink>
        </div>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="container-bw py-24 text-center">
        <p className="text-bw-mute">Корзина пуста.</p>
        <ButtonLink href="/catalog" className="mx-auto mt-6 max-w-xs">В каталог</ButtonLink>
      </div>
    );
  }

  // Вызывается как функция (а не как <F/>), чтобы поля не пересоздавались при вводе и не теряли фокус.
  const F = ({ k, label, type = "text", auto }: { k: Key; label: string; type?: string; auto?: string }) => (
    <label key={k} className="block">
      <span className="meta mb-1 block">{label}</span>
      <input
        className="field"
        type={type}
        autoComplete={auto}
        value={form[k]}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `${k}-err` : undefined}
      />
      {errors[k] && (
        <span id={`${k}-err`} role="alert" className="mt-1 block text-xs text-bw-ice">
          {errors[k]![0]}
        </span>
      )}
    </label>
  );

  const methodTitle = METHODS.find((m) => m.id === method)?.title;

  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ Checkout</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.4rem,10vw,7rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">
        Оформление
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {/* Шаг 1: способ получения */}
          <div role="radiogroup" aria-label="Способ получения" className="grid gap-3 sm:grid-cols-2">
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setMethod(m.id);
                    setErrors({});
                    setFormError("");
                  }}
                  className={clsx(
                    "touch hairline flex flex-col items-start gap-2 p-5 text-left transition-colors duration-300",
                    active ? "border-bw-chrome bg-bw-chrome/10" : "bg-bw-ink hover:border-bw-chrome/60",
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="font-display text-xl font-bold uppercase tracking-tight">{m.title}</span>
                    <span
                      aria-hidden
                      className={clsx("h-4 w-4 shrink-0 rounded-full border", active ? "border-bw-silver bg-bw-silver" : "border-bw-mute")}
                    />
                  </span>
                  <span className="text-sm leading-relaxed text-bw-mute">{m.text}</span>
                </button>
              );
            })}
          </div>

          {/* Шаг 2: данные */}
          {method && (
            <form onSubmit={submit} noValidate className="mt-8 space-y-5">
              <div className="meta">Способ получения: {methodTitle}</div>

              <div className="grid gap-5 sm:grid-cols-2">
                {F({ k: "fullName", label: "Имя и фамилия", auto: "name" })}
                {F({ k: "email", label: "Email", type: "email", auto: "email" })}
                {F({ k: "phone", label: "Телефон", type: "tel", auto: "tel" })}
                {method === "DELIVERY" && (
                  <>
                    {F({ k: "country", label: "Страна", auto: "country-name" })}
                    {F({ k: "city", label: "Город", auto: "address-level2" })}
                    {F({ k: "postalCode", label: "Индекс / № отделения", auto: "postal-code" })}
                  </>
                )}
              </div>
              {method === "DELIVERY" && F({ k: "address", label: "Адрес", auto: "street-address" })}

              {method === "MEETING" && (
                <p className="hairline p-4 text-sm text-bw-chrome">
                  Встреча проходит в г. Сумы. Адрес вводить не нужно: время и место вы согласуете с менеджером{" "}
                  {manager.handle} в Telegram.
                </p>
              )}

              <label className="block">
                <span className="meta mb-1 block">Комментарий</span>
                <textarea className="field min-h-[96px] py-3" value={form.comment} onChange={set("comment")} maxLength={500} />
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={age}
                  onChange={(e) => setAge(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#c9cdd2]"
                  aria-invalid={!!errors.ageConfirmed}
                />
                <span className="text-sm text-bw-chrome">
                  Подтверждаю, что мне исполнилось 18 лет (или возраст, установленный законом моей страны), и принимаю{" "}
                  <Link href="/terms" className="underline">условия использования</Link> и{" "}
                  <Link href="/privacy" className="underline">политику конфиденциальности</Link>.
                </span>
              </label>
              {errors.ageConfirmed && <p role="alert" className="text-xs text-bw-ice">{errors.ageConfirmed[0]}</p>}
              {errors.items && <p role="alert" className="text-xs text-bw-ice">{errors.items[0]}</p>}
              {formError && <p role="alert" className="hairline p-3 text-sm">{formError}</p>}

              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "Отправка…" : method === "MEETING" ? "Оформить и написать менеджеру" : "Подтвердить заказ"}
              </Button>
            </form>
          )}

          {!method && formError && <p role="alert" className="hairline mt-4 p-3 text-sm">{formError}</p>}
          {!method && <p className="mt-4 text-sm text-bw-mute">Выберите способ получения, чтобы продолжить.</p>}
        </div>

        <aside className="hairline h-fit self-start bg-bw-ink p-6 lg:sticky lg:top-28" aria-label="Ваш заказ">
          <div className="meta mb-4">Ваш заказ</div>
          <ul className="space-y-2 text-sm">
            {hydrated &&
              items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{i.name} × {i.quantity}</span>
                  <span className="shrink-0 font-mono">{formatPrice(i.priceCents * i.quantity)}</span>
                </li>
              ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-bw-steel pt-4">
            <span className="meta">Итого</span>
            <span className="font-display text-2xl font-bold">{formatPrice(hydrated ? total : 0)}</span>
          </div>
          {methodTitle && <p className="meta mt-3">{methodTitle}</p>}
          <p className="mt-3 text-xs text-bw-mute">Итоговая цена пересчитывается на сервере. Онлайн-оплата не подключена.</p>
        </aside>
      </div>
    </div>
  );
}
