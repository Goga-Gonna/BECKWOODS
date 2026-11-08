/**
 * Единая конфигурация сайта BECKWOODS.STORE.
 * Все внешние ссылки и контакты редактируются ЗДЕСЬ.
 * Заполните реальные адреса перед запуском: пустая ссылка = элемент не отображается.
 */
export const siteConfig = {
  name: "BECKWOODS.STORE",
  shortName: "BECKWOODS",
  tagline: "Born in the dark. Finished in chrome.",
  description:
    "BECKWOODS.STORE — подпольный люкс-стритвир магазин: безникотиновые жидкости и аксессуары. Только для совершеннолетних.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: "USD",
  locale: "ru-RU",

  legal: {
    /** Минимальный возраст. Уточните по законодательству вашей юрисдикции. */
    minAge: 18,
    /** Платежи отключены до юридической проверки. */
    paymentEnabled: false,
  },

  social: {
    telegram: {
      label: "Telegram",
      handle: "@beckwoods",
      url: "https://t.me/BECKWOODSTORE", // ← замените на свой канал
    },
    instagram: {
      label: "Instagram",
      handle: "@beckwoods.store",
      url: "https://www.instagram.com/beckwoods2026?exln=MW9qdjdlenVvZmVicA%3D%3D&utm_source=qr", // ← замените на свой аккаунт
    },
  },

  contacts: {
    email: "hello@beckwoods.store",
    telegramSupport: "https://t.me/menejment67",
    hours: "Пн–Пт, 10:00–19:00",
  },

  nav: [
    { href: "/catalog", label: "Каталог" },
    { href: "/community", label: "Community" },
    { href: "/faq", label: "FAQ" },
    { href: "/contacts", label: "Контакты" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
