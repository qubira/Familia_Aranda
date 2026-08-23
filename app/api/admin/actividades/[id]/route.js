import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateActividadInput } from "@/lib/actividadValidation";
import { logAudit } from "@/lib/auditLog";

export async function PATCH(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateActividadInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE actividades
    SET nombre = ${data.nombre}, hora_inicio = ${data.horaInicio.toISOString()},
        hora_fin = ${data.horaFin ? data.horaFin.toISOString() : null}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!updated) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  await logAudit(request, {
    accion: "editar",
    entidad: "actividad",
    entidadId: id,
    detalle: `Editó la actividad "${data.nombre}"`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const [deleted] = await sql`DELETE FROM actividades WHERE id = ${id} RETURNING id, nombre`;
  if (!deleted) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  await logAudit(request, {
    accion: "eliminar",
    entidad: "actividad",
    entidadId: id,
    detalle: `Eliminó la actividad "${deleted.nombre}"`,
  });

  return NextResponse.json({ ok: true });
}
