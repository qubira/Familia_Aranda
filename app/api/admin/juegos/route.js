import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateJuegoInput } from "@/lib/juegoValidation";

export async function GET() {
  const juegos = await sql`SELECT id, nombre, descripcion, estado FROM juegos ORDER BY created_at DESC`;
  return NextResponse.json({ juegos });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateJuegoInput({ ...body, estado: "propuesto" });
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [juego] = await sql`
    INSERT INTO juegos (nombre, descripcion, estado)
    VALUES (${data.nombre}, ${data.descripcion}, ${data.estado})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, id: juego.id }, { status: 201 });
}
