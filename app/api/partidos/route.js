import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const partidos = await sql`
    SELECT p.id, p.hora_inicio, p.hora_fin, p.ronda,
           j.nombre AS juego_nombre, j.imagen_url AS juego_imagen,
           ea.id AS equipo_a_id, ea.nombre AS equipo_a_nombre, ea.color AS equipo_a_color, ea.logo_url AS equipo_a_logo,
           eb.id AS equipo_b_id, eb.nombre AS equipo_b_nombre, eb.color AS equipo_b_color, eb.logo_url AS equipo_b_logo,
           p.ganador_id
    FROM partidos p
    JOIN juegos j ON j.id = p.juego_id
    JOIN equipos ea ON ea.id = p.equipo_a_id
    JOIN equipos eb ON eb.id = p.equipo_b_id
    ORDER BY p.hora_inicio ASC
  `;
  return NextResponse.json({ partidos });
}
