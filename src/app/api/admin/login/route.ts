import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { badRequest, route, unauthorized } from "@/lib/errors";
import { loginInput } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Хэш-заглушка: выравнивает время ответа, если пользователя нет.
const DUMMY = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5yD0o8mXr1uW0yq8oY9z3kq0S3vJ3Aa";

export const POST = route(async (req: Request) => {
  rateLimit(`login:${clientIp(req)}`, 5, 15 * 60_000);

  const json = await req.json().catch(() => {
    throw badRequest("Некорректный JSON");
  });
  const { email, password } = loginInput.parse(json);

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY);
  if (!admin || !ok) throw unauthorized("Неверный email или пароль");

  await createSession(admin.id, admin.email);
  return NextResponse.json({ ok: true });
});
