import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = route(async (req: Request) => {
  await requireAdmin();
  const status = new URL(req.url).searchParams.get("status") || undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: true },
  });
  return NextResponse.json({ orders });
});
