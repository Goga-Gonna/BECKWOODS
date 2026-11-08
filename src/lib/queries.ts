import { prisma } from "./prisma";
import type { ProductDTO } from "@/components/catalog/types";

type Row = Awaited<ReturnType<typeof prisma.product.findMany<{ include: { category: true } }>>>[number];

export function toDTO(p: Row): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    details: p.details,
    priceCents: p.priceCents,
    currency: p.currency,
    stock: p.stock,
    images: p.images,
    tags: p.tags,
    featured: p.featured,
    category: { slug: p.category.slug, name: p.category.name },
  };
}

/** Серверные выборки с защитой от недоступной БД (страница не падает). */
export async function getFeatured(limit = 4): Promise<ProductDTO[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { category: true },
    });
    return rows.map(toDTO);
  } catch (e) {
    console.error("[queries] getFeatured failed", e);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const p = await prisma.product.findFirst({ where: { slug, active: true }, include: { category: true } });
    return p ? toDTO(p) : null;
  } catch (e) {
    console.error("[queries] getProductBySlug failed", e);
    return null;
  }
}

export async function getRelated(categorySlug: string, excludeId: string, limit = 4): Promise<ProductDTO[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, id: { not: excludeId }, category: { slug: categorySlug } },
      take: limit,
      include: { category: true },
    });
    return rows.map(toDTO);
  } catch {
    return [];
  }
}
