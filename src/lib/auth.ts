import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { unauthorized } from "./errors";

export const SESSION_COOKIE = "bw_admin";
const MAX_AGE = 60 * 60 * 8; // 8 часов

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET не задан или короче 32 символов");
  return new TextEncoder().encode(s);
}

export async function createSession(adminId: string, email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: String(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function getAdmin() {
  return verifyToken(cookies().get(SESSION_COOKIE)?.value);
}

/** Для route handlers и серверных страниц админки. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw unauthorized();
  return admin;
}
