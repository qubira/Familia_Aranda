import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateJuegoInput } from "@/lib/juegoValidation";

export async function PATCH(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateJuegoInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE juegos
    SET nombre = ${data.nombre}, descripcion = ${data.descripcion}, estado = ${data.estado}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!updated) {
    return NextResponse.json({ error: "El juego no existe." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM partidos WHERE juego_id = ${id}`;
  if (count > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${count} partido(s) programado(s).` },
      { status: 409 }
    );
  }

  const [deleted] = await sql`DELETE FROM juegos WHERE id = ${id} RETURNING id`;
  if (!deleted) {
    return NextResponse.json({ error: "El juego no existe." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
