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
      url: "https://t.me/beckwoods", // ← замените на свой канал
    },
    instagram: {
      label: "Instagram",
      handle: "@beckwoods.store",
      url: "https://instagram.com/beckwoods.store", // ← замените на свой аккаунт
    },
  },

  contacts: {
    email: "hello@beckwoods.store",
    telegramSupport: "https://t.me/beckwoods_support",
    hours: "Пн–Пт, 10:00–19:00",
    /** Менеджер: сюда переходит покупатель, выбравший «Встреча в Сумах». */
    manager: {
      handle: "@menejment67",
      url: "https://t.me/menejment67",
    },
  },

  nav: [
    { href: "/catalog", label: "Каталог" },
    { href: "/community", label: "Community" },
    { href: "/faq", label: "FAQ" },
    { href: "/contacts", label: "Контакты" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
