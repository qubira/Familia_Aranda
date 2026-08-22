import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateInscripcionInput } from "@/lib/inscripcionValidation";

export async function PATCH(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateInscripcionInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const equipoExiste = await sql`SELECT id FROM equipos WHERE id = ${data.equipoId}`;
  if (equipoExiste.length === 0) {
    return NextResponse.json(
      { error: "El equipo seleccionado no existe." },
      { status: 400 }
    );
  }

  const [updated] = await sql`
    UPDATE inscripciones
    SET nombre_completo = ${data.nombreCompleto}, email = ${data.email},
        telefono = ${data.telefono}, categoria = ${data.categoria},
        edad = ${data.edad}, equipo_id = ${data.equipoId}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!updated) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const [deleted] = await sql`DELETE FROM inscripciones WHERE id = ${id} RETURNING id`;
  if (!deleted) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
