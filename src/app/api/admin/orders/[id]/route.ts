import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { orderStatusInput } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { status } = orderStatusInput.parse(await req.json());

  try {
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
      if (!current) throw notFound("Заказ не найден");

      // При отмене возвращаем товар на склад (один раз)
      if (status === "CANCELLED" && current.status !== "CANCELLED") {
        for (const i of current.items) {
          await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
        }
      }
      // Повторная активация отменённого заказа — снова списываем
      if (current.status === "CANCELLED" && status !== "CANCELLED") {
        for (const i of current.items) {
          const r = await tx.product.updateMany({
            where: { id: i.productId, stock: { gte: i.quantity } },
            data: { stock: { decrement: i.quantity } },
          });
          if (r.count === 0) throw notFound(`Недостаточно остатков: ${i.nameSnapshot}`);
        }
      }
      return tx.order.update({ where: { id: params.id }, data: { status } });
    });
    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") throw notFound("Заказ не найден");
    throw e;
  }
});
