import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { route } from "@/lib/errors";

export const POST = route(async () => {
  destroySession();
  return NextResponse.json({ ok: true });
});
