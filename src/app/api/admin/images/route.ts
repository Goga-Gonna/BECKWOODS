import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, route } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024; // лимит Vercel на тело запроса — 4.5 МБ; браузер уже сжимает фото

/** Проверка «магических байтов»: не доверяем заголовку Content-Type. */
function validSignature(b: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (mime === "image/png")
    return b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp")
    return b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

/** Загрузка одного изображения (тело запроса — сам файл). Только для администратора. */
export const POST = route(async (req: Request) => {
  await requireAdmin();

  const mime = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED.includes(mime)) throw badRequest("Допустимы только JPEG, PNG и WebP");

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0) throw badRequest("Пустой файл");
  if (buf.length > MAX_BYTES) throw badRequest("Файл больше 3 МБ");
  if (!validSignature(buf, mime)) throw badRequest("Файл не является изображением");

  const img = await prisma.productImage.create({ data: { mime, data: buf }, select: { id: true } });
  return NextResponse.json({ url: `/api/images/${img.id}` }, { status: 201 });
});
