import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "bw_admin";

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const s = process.env.AUTH_SECRET;
  if (!token || !s || s.length < 32) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(s));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isAdminPage || isAdminApi) {
    if (!(await isAuthed(req))) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Требуется авторизация" } },
          { status: 401 },
        );
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
