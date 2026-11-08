import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const GET = route(async (_req: Request, { params }: { params: { slug: string } }) => {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, active: true },
    include: { category: { select: { slug: true, name: true } } },
  });
  if (!product) throw notFound("Товар не найден");
  return NextResponse.json({ product });
});
