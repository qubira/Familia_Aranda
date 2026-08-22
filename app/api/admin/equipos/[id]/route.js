import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export async function PATCH(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const nombre = String(body.nombre || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  const color = String(body.color || "").trim();

  if (!nombre || nombre.length > 100) {
    return NextResponse.json({ error: "El nombre del equipo es obligatorio." }, { status: 400 });
  }
  if (!HEX_COLOR_RE.test(color)) {
    return NextResponse.json({ error: "Color inválido." }, { status: 400 });
  }
  if (descripcion.length > 300) {
    return NextResponse.json({ error: "La descripción es demasiado larga." }, { status: 400 });
  }

  try {
    const [updated] = await sql`
      UPDATE equipos
      SET nombre = ${nombre}, descripcion = ${descripcion || null}, color = ${color}
      WHERE id = ${id}
      RETURNING id
    `;
    if (!updated) {
      return NextResponse.json({ error: "El equipo no existe." }, { status: 404 });
    }
  } catch (err) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un equipo con ese nombre." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
