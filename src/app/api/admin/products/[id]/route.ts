import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { conflict, notFound, route } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { productPatch } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) throw notFound("Товар не найден");
  return NextResponse.json({ product });
});

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const data = productPatch.parse(await req.json());
  try {
    const product = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") throw notFound("Товар не найден");
      if (e.code === "P2002") throw conflict("Товар с таким slug уже существует");
    }
    throw e;
  }
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id: params.id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") throw notFound("Товар не найден");
      // Есть связанные заказы — скрываем вместо удаления, чтобы не ломать историю
      if (e.code === "P2003") {
        await prisma.product.update({ where: { id: params.id }, data: { active: false } });
        return NextResponse.json({ ok: true, archived: true });
      }
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
});
