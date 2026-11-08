import type { Metadata } from "next";
import { InfoPage } from "@/components/ui/InfoPage";
import { siteConfig } from "@config/site";

export const metadata: Metadata = { title: "FAQ" };

const faq = [
  ["Кто может совершать покупки?", `Только лица, достигшие ${siteConfig.legal.minAge} лет (или возраста, установленного законодательством страны покупателя).`],
  ["Содержат ли жидкости никотин?", "Нет. Весь ассортимент жидкостей — 0 мг никотина."],
  ["Принимаете ли вы оплату на сайте?", "Нет. Сейчас сайт работает в демонстрационном режиме: заказы фиксируются, но оплата и отправка не производятся."],
  ["Как посмотреть мои заказы?", "На странице «Мои заказы» введите email и номер заказа (BW-XXXXXXXX)."],
  ["Как связаться с поддержкой?", "Через страницу «Контакты» — email или Telegram."],
  ["Есть ли у товаров оздоровительное действие?", "Мы не заявляем и не обещаем медицинских или оздоровительных эффектов."],
];

export default function FaqPage() {
  return (
    <InfoPage eyebrow="FAQ" title="Вопросы">
      <div className="divide-y divide-bw-steel border-y border-bw-steel">
        {faq.map(([q, a]) => (
          <details key={q} className="group py-1">
            <summary className="touch flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold uppercase tracking-tight text-bw-silver">
              {q}
              <span aria-hidden className="transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="pb-5 text-bw-mute">{a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
