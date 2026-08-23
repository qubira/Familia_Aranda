import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateEquipoInput } from "@/lib/equipoValidation";
import { logAudit } from "@/lib/auditLog";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateEquipoInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const [equipo] = await sql`
      INSERT INTO equipos (nombre, descripcion, color)
      VALUES (${data.nombre}, ${data.descripcion}, ${data.color})
      RETURNING id
    `;
    await logAudit(request, {
      accion: "crear",
      entidad: "equipo",
      entidadId: equipo.id,
      detalle: `Creó el equipo "${data.nombre}"`,
    });
    return NextResponse.json({ ok: true, id: equipo.id }, { status: 201 });
  } catch (err) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un equipo con ese nombre." }, { status: 409 });
    }
    throw err;
  }
}
