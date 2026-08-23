import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateActividadInput } from "@/lib/actividadValidation";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
  const actividades = await sql`
    SELECT id, nombre, hora_inicio, hora_fin FROM actividades ORDER BY hora_inicio ASC
  `;
  return NextResponse.json({ actividades });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateActividadInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [actividad] = await sql`
    INSERT INTO actividades (nombre, hora_inicio, hora_fin)
    VALUES (${data.nombre}, ${data.horaInicio.toISOString()}, ${data.horaFin ? data.horaFin.toISOString() : null})
    RETURNING id
  `;

  await logAudit(request, {
    accion: "crear",
    entidad: "actividad",
    entidadId: actividad.id,
    detalle: `Creó la actividad "${data.nombre}"`,
  });

  return NextResponse.json({ ok: true, id: actividad.id }, { status: 201 });
}
