import { NextResponse } from "next/server";
import { COOKIE_NAME, computeToken } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await computeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
