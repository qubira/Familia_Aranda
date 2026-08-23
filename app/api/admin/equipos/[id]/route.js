import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateEquipoInput } from "@/lib/equipoValidation";
import { deleteImage } from "@/lib/cloudinary";
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

  const { error, data } = validateEquipoInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const [updated] = await sql`
      UPDATE equipos
      SET nombre = ${data.nombre}, descripcion = ${data.descripcion}, color = ${data.color}
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

  await logAudit(request, {
    accion: "editar",
    entidad: "equipo",
    entidadId: id,
    detalle: `Editó el equipo "${data.nombre}"`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM inscripciones WHERE equipo_id = ${id}`;
  if (count > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${count} inscripción(es). Reasígnalas o bórralas primero.` },
      { status: 409 }
    );
  }

  const [{ count: totalEquipos }] = await sql`SELECT COUNT(*)::int AS count FROM equipos`;
  if (totalEquipos <= 1) {
    return NextResponse.json({ error: "Debe existir al menos un equipo." }, { status: 400 });
  }

  const [deleted] = await sql`DELETE FROM equipos WHERE id = ${id} RETURNING nombre, logo_public_id`;
  if (!deleted) {
    return NextResponse.json({ error: "El equipo no existe." }, { status: 404 });
  }

  if (deleted.logo_public_id) {
    deleteImage(deleted.logo_public_id).catch(() => {});
  }

  await logAudit(request, {
    accion: "eliminar",
    entidad: "equipo",
    entidadId: id,
    detalle: `Eliminó el equipo "${deleted.nombre}"`,
  });

  return NextResponse.json({ ok: true });
}
