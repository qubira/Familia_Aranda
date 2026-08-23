import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const registros = await sql`
    SELECT id, accion, entidad, entidad_id, detalle, ip, dispositivo, created_at
    FROM bitacora
    ORDER BY created_at DESC
    LIMIT 300
  `;
  return NextResponse.json({ registros });
}
