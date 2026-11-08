import { z } from "zod";

const slug = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница, цифры и дефисы");

export const productInput = z.object({
  slug,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(400),
  details: z.string().trim().max(4000).default(""),
  priceCents: z.number().int().min(0).max(10_000_000),
  stock: z.number().int().min(0).max(100_000),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(10).default([]),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().min(1),
});
export const productPatch = productInput.partial();

export const orderInput = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,20}$/, "Некорректный телефон"),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(4).max(200),
  postalCode: z.string().trim().min(3).max(12),
  comment: z.string().trim().max(500).default(""),
  ageConfirmed: z.literal(true, { errorMap: () => ({ message: "Необходимо подтвердить совершеннолетие" }) }),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Корзина пуста")
    .max(50),
});

export const orderStatusInput = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const loginInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const orderLookupInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  number: z.string().trim().min(4).max(30),
});
