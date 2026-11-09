import { notFound, route } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Публичная отдача загруженного фото. Адрес содержит случайный id, содержимое не меняется — кэшируем надолго. */
export const GET = route(async (_req: Request, { params }: { params: { id: string } }) => {
  const img = await prisma.productImage.findUnique({ where: { id: params.id } });
  if (!img) throw notFound("Изображение не найдено");

  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
