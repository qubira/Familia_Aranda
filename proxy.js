import { NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionToken } from "@/lib/auth";

export async function proxy(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!(await isValidSessionToken(token))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/inscripciones",
    "/api/admin/inscripciones/:path*",
    "/api/admin/export",
    "/api/admin/equipos/:path*",
    "/api/admin/galeria",
    "/api/admin/galeria/:path*",
  ],
};
