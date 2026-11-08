import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { conflict, route } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { productInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  await requireAdmin();
  const [items, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ items, categories });
});

export const POST = route(async (req: Request) => {
  await requireAdmin();
  const data = productInput.parse(await req.json());
  try {
    const product = await prisma.product.create({ data });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw conflict("Товар с таким slug уже существует");
    throw e;
  }
});
