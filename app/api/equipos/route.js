import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const equipos = await sql`
    SELECT e.id, e.nombre, e.color, e.descripcion, e.logo_url, COUNT(i.id)::int AS inscritos
    FROM equipos e
    LEFT JOIN inscripciones i ON i.equipo_id = e.id
    GROUP BY e.id
    ORDER BY e.id
  `;
  return NextResponse.json({ equipos });
}
