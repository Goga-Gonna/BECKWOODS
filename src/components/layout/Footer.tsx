"use client";

import Link from "next/link";
import { siteConfig } from "@config/site";
import { useLite } from "@/lib/device";
import { useUI } from "@/store/ui";
import { SocialOrbit } from "@/components/social/SocialOrbit";

export function Footer() {
  const lite = useLite();
  const setLite = useUI((s) => s.setLiteOverride);

  return (
    <footer className="mt-24 border-t border-bw-steel">
      <div className="container-bw py-12 lg:py-16">
        <div className="chrome-text select-none font-display text-[clamp(2.5rem,13.5vw,12rem)] font-bold uppercase leading-[0.85] tracking-[-0.05em]">
          {siteConfig.shortName}
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="meta max-w-sm leading-relaxed">{siteConfig.tagline}</p>
            <div className="mt-6 max-w-md">
              <SocialOrbit variant="dock" />
            </div>
          </div>
          <FooterCol title="Магазин" links={[["/catalog", "Каталог"], ["/favorites", "Избранное"], ["/cart", "Корзина"], ["/orders", "Мои заказы"]]} />
          <FooterCol title="Информация" links={[["/faq", "FAQ"], ["/contacts", "Контакты"], ["/privacy", "Конфиденциальность"], ["/terms", "Условия использования"]]} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-bw-steel pt-6 text-xs text-bw-mute md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl leading-relaxed">
            © {new Date().getFullYear()} {siteConfig.name}. Только для лиц {siteConfig.legal.minAge}+. Товары не содержат никотина.
            Сайт работает в демонстрационном режиме: оплата не принимается.
          </p>
          <button
            onClick={() => setLite(!lite)}
            className="touch hairline self-start px-4 font-mono text-[11px] uppercase tracking-[0.16em] hover:border-bw-chrome"
            aria-pressed={lite}
          >
            Облегчённый режим: {lite ? "вкл" : "выкл"}
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="meta mb-4">{title}</div>
      <ul className="space-y-1">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="touch flex items-center text-sm text-bw-silver transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
