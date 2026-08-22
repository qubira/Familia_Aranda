import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const fotos = await sql`
    SELECT id, url, descripcion, created_at
    FROM fotos_evento
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ fotos });
}
