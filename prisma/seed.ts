import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { slug: "liquids", name: "Жидкости (0 мг никотина)" },
  { slug: "accessories", name: "Аксессуары" },
  { slug: "merch", name: "Merch" },
];

type Seed = {
  slug: string;
  name: string;
  description: string;
  details: string;
  priceCents: number;
  stock: number;
  category: string;
  tags: string[];
  featured?: boolean;
};

const products: Seed[] = [
  { slug: "chrome-mist-60", name: "Chrome Mist 60 ml", description: "Холодный мятно-цитрусовый профиль. 0 мг никотина.", details: "Объём 60 мл. Без никотина. Только для совершеннолетних.", priceCents: 1800, stock: 42, category: "liquids", tags: ["mint", "citrus", "0mg"], featured: true },
  { slug: "night-orchard-60", name: "Night Orchard 60 ml", description: "Тёмные ягоды и чёрная смородина. 0 мг никотина.", details: "Объём 60 мл. Без никотина. Только для совершеннолетних.", priceCents: 1800, stock: 30, category: "liquids", tags: ["berry", "0mg"], featured: true },
  { slug: "graphite-tobacco-60", name: "Graphite Leaf 60 ml", description: "Сухой ореховый профиль с нотой ванили. 0 мг никотина.", details: "Объём 60 мл. Без никотина. Только для совершеннолетних.", priceCents: 1900, stock: 0, category: "liquids", tags: ["nutty", "0mg"] },
  { slug: "steel-case", name: "Steel Case", description: "Матовый металлический кейс для хранения аксессуаров.", details: "Алюминий, матовое анодирование. Размер 120×60×25 мм.", priceCents: 3500, stock: 15, category: "accessories", tags: ["case", "metal"], featured: true },
  { slug: "chrome-tray", name: "Chrome Tray", description: "Лоток из полированной нержавеющей стали.", details: "Нержавеющая сталь, полировка зеркальная.", priceCents: 2400, stock: 20, category: "accessories", tags: ["tray", "chrome"] },
  { slug: "beckwoods-tee-black", name: "BECKWOODS Tee / Black", description: "Плотная чёрная футболка, хромированный принт.", details: "100% хлопок, 240 г/м². Оверсайз крой.", priceCents: 4500, stock: 25, category: "merch", tags: ["tee", "streetwear"] },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
  }

  for (const p of products) {
    const cat = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details,
        priceCents: p.priceCents,
        stock: p.stock,
        tags: p.tags,
        featured: p.featured ?? false,
        images: [],
        categoryId: cat.id,
      },
    });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    throw new Error("Задайте ADMIN_EMAIL и ADMIN_PASSWORD (не короче 10 символов) в .env");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("Seed завершён. Администратор:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
