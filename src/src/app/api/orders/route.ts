import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { badRequest, conflict, route } from "@/lib/errors";
import { orderInput, orderLookupInput } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function orderNumber() {
  return "BW-" + randomBytes(4).toString("hex").toUpperCase();
}

/** Создание заказа (демо-режим: оплата не производится). Цены берутся из БД, а не от клиента. */
export const POST = route(async (req: Request) => {
  rateLimit(`order:${clientIp(req)}`, 10, 60_000);

  const json = await req.json().catch(() => {
    throw badRequest("Некорректный JSON");
  });
  const data = orderInput.parse(json);

  // Объединяем дубликаты товаров
  const qty = new Map<string, number>();
  for (const i of data.items) qty.set(i.productId, (qty.get(i.productId) ?? 0) + i.quantity);

  // «Встреча в Сумах» не требует адреса — подставляем служебные значения
  const ship =
    data.deliveryMethod === "MEETING"
      ? { country: "Украина", city: "Сумы", address: "Личная встреча", postalCode: "—" }
      : { country: data.country, city: data.city, address: data.address, postalCode: data.postalCode };

  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: Array.from(qty.keys()) }, active: true },
    });
    if (products.length !== qty.size) throw badRequest("Часть товаров больше недоступна");

    let total = 0;
    const lines = products.map((p) => {
      const q = qty.get(p.id)!;
      if (p.stock < q) throw conflict(`Недостаточно на складе: ${p.name} (доступно ${p.stock})`);
      total += p.priceCents * q;
      return { productId: p.id, nameSnapshot: p.name, unitPriceCents: p.priceCents, quantity: q };
    });

    // Атомарное списание остатков
    for (const l of lines) {
      const r = await tx.product.updateMany({
        where: { id: l.productId, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (r.count === 0) throw conflict("Товар только что закончился. Обновите корзину.");
    }

    return tx.order.create({
      data: {
        number: orderNumber(),
        deliveryMethod: data.deliveryMethod,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        ...ship,
        comment: data.comment,
        ageConfirmed: true,
        totalCents: total,
        items: { create: lines },
      },
      include: { items: true },
    });
  });

  return NextResponse.json(
    {
      order: {
        number: order.number,
        totalCents: order.totalCents,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
      },
      demo: true,
    },
    { status: 201 },
  );
});

/** История заказов: email + номер заказа (без аккаунтов). */
export const GET = route(async (req: Request) => {
  rateLimit(`lookup:${clientIp(req)}`, 20, 60_000);
  const sp = new URL(req.url).searchParams;
  const { email, number } = orderLookupInput.parse({
    email: sp.get("email"),
    number: sp.get("number"),
  });

  const first = await prisma.order.findFirst({ where: { email, number: number.toUpperCase() } });
  if (!first) return NextResponse.json({ orders: [] });

  const orders = await prisma.order.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      number: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      items: { select: { nameSnapshot: true, quantity: true, unitPriceCents: true } },
    },
  });
  return NextResponse.json({ orders });
});
