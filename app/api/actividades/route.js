import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const actividades = await sql`
    SELECT id, nombre, hora_inicio, hora_fin FROM actividades ORDER BY hora_inicio ASC
  `;
  return NextResponse.json({ actividades });
}
