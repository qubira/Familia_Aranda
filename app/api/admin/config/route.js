import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
  const [config] = await sql`SELECT evento_nombre, evento_fecha, evento_sede FROM configuracion WHERE id = 1`;
  return NextResponse.json({ config: config || {} });
}

export async function PUT(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const nombre = String(body.eventoNombre || "").trim();
  const sede = String(body.eventoSede || "").trim();
  const fechaRaw = body.eventoFecha ? new Date(body.eventoFecha) : null;

  if (nombre.length > 200) {
    return NextResponse.json({ error: "El nombre del evento es demasiado largo." }, { status: 400 });
  }
  if (sede.length > 200) {
    return NextResponse.json({ error: "La sede es demasiado larga." }, { status: 400 });
  }
  if (fechaRaw && Number.isNaN(fechaRaw.getTime())) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  await sql`
    UPDATE configuracion
    SET evento_nombre = ${nombre || null},
        evento_fecha = ${fechaRaw ? fechaRaw.toISOString() : null},
        evento_sede = ${sede || null}
    WHERE id = 1
  `;

  await logAudit(request, {
    accion: "editar",
    entidad: "configuracion",
    detalle: `Actualizó la configuración del evento (${nombre || "sin nombre"})`,
  });

  return NextResponse.json({ ok: true });
}
