import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const inscritos = await sql`
    SELECT i.id, i.nombre_completo, i.foto_url, e.nombre AS equipo, e.color AS equipo_color
    FROM inscripciones i
    JOIN equipos e ON e.id = i.equipo_id
    ORDER BY e.id, i.created_at ASC
  `;
  return NextResponse.json({ inscritos });
}
