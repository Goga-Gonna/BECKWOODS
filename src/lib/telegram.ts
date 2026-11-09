import { siteConfig } from "@config/site";
import { formatPrice } from "./format";

type Line = { name: string; quantity: number; priceCents: number };

/** Ссылка на чат с менеджером; с text — с заранее заполненным сообщением. */
export function managerLink(text?: string): string {
  const base = siteConfig.contacts.manager.url;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Шаблон сообщения менеджеру при выборе «Встреча в Сумах». */
export function buildMeetingMessage(o: {
  number: string;
  fullName: string;
  phone: string;
  items: Line[];
  totalCents: number;
}): string {
  const lines = o.items.map((i) => `• ${i.name} × ${i.quantity} — ${formatPrice(i.priceCents * i.quantity)}`);
  return [
    "Здравствуйте! Оформил(а) заказ на сайте BECKWOODS.STORE и хочу встретиться в Сумах.",
    "",
    `Заказ: ${o.number}`,
    `Имя: ${o.fullName}`,
    `Телефон: ${o.phone}`,
    "",
    "Товары:",
    ...lines,
    `Итого: ${formatPrice(o.totalCents)}`,
    "",
    "Когда и где можно встретиться?",
  ].join("\n");
}
