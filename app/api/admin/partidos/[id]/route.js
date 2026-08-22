import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validatePartidoInput } from "@/lib/partidoValidation";

export async function PATCH(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validatePartidoInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [juego] = await sql`SELECT id FROM juegos WHERE id = ${data.juegoId}`;
  if (!juego) {
    return NextResponse.json({ error: "El juego seleccionado no existe." }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE partidos
    SET juego_id = ${data.juegoId}, equipo_a_id = ${data.equipoAId}, equipo_b_id = ${data.equipoBId},
        hora_inicio = ${data.horaInicio.toISOString()}, hora_fin = ${data.horaFin.toISOString()}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!updated) {
    return NextResponse.json({ error: "El partido no existe." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const [deleted] = await sql`DELETE FROM partidos WHERE id = ${id} RETURNING id`;
  if (!deleted) {
    return NextResponse.json({ error: "El partido no existe." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
