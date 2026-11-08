# BECKWOODS.STORE — концепция, структура, дизайн-система, архитектура

## 1. Концепция

**Идея:** «Chrome in the dark». Магазин как закрытый подпольный клуб будущего: чёрное пространство,
в котором на свету проявляются хромированные объекты. Каждый товар «достаётся из тьмы» световым лучом.

**Слоган:** `BORN IN THE DARK. FINISHED IN CHROME.`

**Ощущения:** тишина, масса, холодный металл, точные движения. Минимум цвета, максимум материала.

**Ядро визуального языка**
- Хромированный 3D-знак (монограмма «B» / тор-узел) в Hero, реагирует на курсор и гироскоп.
- Объёмный свет: холодный луч сверху, тонкая зернистость (film grain), виньетка.
- Типографика-плакат: огромные заголовки, моноширинные микроподписи (техно-метаданные: `№ 001 / IN STOCK`).
- Переходы между страницами — «шторка-затвор» (диафрагма), а не fade.

**Аудитория и комплаенс.** Только совершеннолетние. Ассортимент — легально реализуемые товары:
безникотиновые жидкости и аксессуары. Без медицинских и оздоровительных обещаний, без
образов для несовершеннолетних. Платежи отключены (демо-режим) до юридической проверки.

## 2. Структура страниц

| Маршрут | Назначение |
|---|---|
| `/` | Hero (3D) → Manifesto → Featured drop → Категории → COMMUNITY → футер |
| `/catalog` | Категории, поиск, сортировка, фильтры, пагинация |
| `/product/[slug]` | Галерея, описание, наличие, добавить в корзину, избранное, похожие |
| `/cart` | Корзина (на мобильных — нижняя шторка + полная страница) |
| `/checkout` | Форма, валидация, демо-подтверждение (без оплаты) |
| `/orders` | История заказов (по email + номеру заказа) |
| `/favorites` | Избранное |
| `/community` | BECKWOODS COMMUNITY: Telegram, Instagram |
| `/faq`, `/contacts`, `/privacy`, `/terms` | Информационные |
| `/admin/login` | Вход администратора |
| `/admin` | Дашборд |
| `/admin/products`, `/admin/products/[id]` | CRUD товаров, цены, остатки |
| `/admin/orders`, `/admin/orders/[id]` | Заказы и смена статусов |
| Модалка 18+ | Показывается при первом визите, запоминается в cookie |

## 3. Дизайн-система

**Цвета**
- `--bw-black: #050506` фон
- `--bw-ink: #0B0B0D` поверхности
- `--bw-graphite: #141416`, `--bw-steel: #1F2023` карточки/границы
- `--bw-chrome: #C9CDD2`, `--bw-silver: #E6E8EB`, `--bw-mute: #7A7F87`
- Акцент: `--bw-ice: #8FB8FF` (холодный свет, использовать точечно)

**Типографика:** заголовки — `Space Grotesk` (700, tracking −0.04em, uppercase); текст — `Inter`;
метаданные — `JetBrains Mono`. Fluid-размеры через `clamp()`, на 320 px заголовок Hero ≥ 14vw.

**Сетка и отступы:** 4-pt шкала; контейнер `max-w-[1440px]`, боковые поля 16 px (mobile) / 48 px (desktop).

**Компоненты:** `Button` (магнитный на desktop, 44×44 min touch), `ProductCard`, `Chip`, `Drawer`,
`Modal`, `Input`, `Badge` (наличие), `SocialOrbit`, `Preloader`, `PageTransition`.

**Движение:** кривая `cubic-bezier(.22,1,.36,1)`; 200–300 мс микроанимации, 600–900 мс секции.
`prefers-reduced-motion` отключает всё, кроме fade.

## 4. Мобильная стратегия (отдельный UX, не «сжатый десктоп»)

- Верхняя панель 56 px + safe-area-top: логотип, поиск, корзина с счётчиком, бургер.
- Нижняя навигация (tab bar) с safe-area-bottom: Главная / Каталог / Избранное / Корзина.
- Меню — полноэкранный оверлей с крупными пунктами и социальной панелью.
- Hero: облегчённая 3D-сцена (меньше полигонов, DPR ≤ 1.5, без постобработки), управление гироскопом/touch.
- Каталог: 2 колонки на ≥360 px, 1 колонка на 320 px; фильтры — нижняя шторка.
- Корзина: нижняя шторка со свайпом; чекаут — одноколоночный, sticky-итог.
- Haptics: `navigator.vibrate` (Android) на добавление в корзину, где поддерживается.
- **Режим Lite** (авто): слабое устройство (`hardwareConcurrency ≤ 4`, `deviceMemory ≤ 4`,
  `saveData`, медленная сеть) или ручной переключатель → статичный постер вместо WebGL.
- Нет горизонтального скролла: `overflow-x: clip` на корне, `min-width: 0` в flex/grid.

## 5. Архитектура

- **Next.js 14 (App Router) + React + TypeScript**, Tailwind, Framer Motion + GSAP (ScrollTrigger).
- **3D:** `@react-three/fiber` + `@react-three/drei`, подгрузка через `next/dynamic` (ssr: false).
- **БД:** PostgreSQL + Prisma (Product, Category, Order, OrderItem, AdminUser).
- **API:** Route Handlers `/api/*`; валидация `zod`; единый формат ошибок; rate-limit в памяти.
- **Auth админа:** bcrypt + JWT (`jose`) в httpOnly cookie, middleware на `/admin` и `/api/admin`.
- **Корзина / избранное:** Zustand + localStorage (persist); цены пересчитываются на сервере при оформлении.
- **Оплата:** отсутствует. Заказ создаётся со статусом `PENDING`, `PAYMENT_ENABLED=false`.
- **Конфигурация:** `config/site.ts` (ссылки Telegram/Instagram, контакты, флаги) + `.env`.

## 6. Структура файлов

```
beckwoods/
├─ docs/CONCEPT.md
├─ README.md
├─ package.json  tsconfig.json  next.config.mjs  tailwind.config.ts  postcss.config.js
├─ .env.example
├─ middleware.ts
├─ config/site.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx  globals.css  page.tsx
│  │  ├─ catalog/page.tsx
│  │  ├─ product/[slug]/page.tsx
│  │  ├─ cart/page.tsx  checkout/page.tsx  orders/page.tsx  favorites/page.tsx
│  │  ├─ community/page.tsx  faq/page.tsx  contacts/page.tsx  privacy/page.tsx  terms/page.tsx
│  │  ├─ admin/(login, dashboard, products, orders)
│  │  └─ api/
│  │     ├─ products/route.ts  products/[slug]/route.ts
│  │     ├─ orders/route.ts
│  │     └─ admin/(login, logout, products, orders)
│  ├─ components/
│  │  ├─ layout/(Header, MobileNav, TabBar, Footer, Preloader, PageTransition, AgeGate)
│  │  ├─ home/(Hero, Manifesto, FeaturedDrop, Categories, Community)
│  │  ├─ three/(HeroScene, ChromeKnot, Lite poster)
│  │  ├─ catalog/(ProductCard, Filters, SortSelect, SearchBar)
│  │  ├─ cart/(CartDrawer, CartLine)
│  │  ├─ social/SocialOrbit.tsx
│  │  └─ ui/(Button, Input, Badge, Modal, Drawer)
│  ├─ lib/(prisma, auth, validation, errors, rate-limit, format, device)
│  └─ store/(cart, favorites, ui)
```

## 7. Порядок реализации

1. Каркас и конфиги → 2. Prisma + seed → 3. API и auth → 4. UI-кит и layout →
5. Главная и 3D → 6. Каталог и товар → 7. Корзина, чекаут, заказы → 8. Админка →
9. Информационные страницы, 18+ → 10. README и чек-лист тестирования.
