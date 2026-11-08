import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/errors";

export const dynamic = "force-dynamic";

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  new: { createdAt: "desc" },
  "price-asc": { priceCents: "asc" },
  "price-desc": { priceCents: "desc" },
  name: { name: "asc" },
};

export const GET = route(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim().slice(0, 80);
  const category = sp.get("category") || undefined;
  const inStock = sp.get("inStock") === "1";
  const sort = SORTS[sp.get("sort") ?? "new"] ?? SORTS.new;
  const min = Number(sp.get("min"));
  const max = Number(sp.get("max"));
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const take = Math.min(48, Math.max(1, Number(sp.get("limit")) || 12));

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
    ...(Number.isFinite(min) && min > 0 ? { priceCents: { gte: Math.round(min * 100) } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
          ],
        }
      : {}),
  };
  if (Number.isFinite(max) && max > 0) {
    where.priceCents = { ...(where.priceCents as object), lte: Math.round(max * 100) };
  }

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sort,
      skip: (page - 1) * take,
      take,
      include: { category: { select: { slug: true, name: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.max(1, Math.ceil(total / take)), categories });
});
