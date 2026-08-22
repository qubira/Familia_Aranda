import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validatePartidoInput } from "@/lib/partidoValidation";

export async function GET() {
  const partidos = await sql`
    SELECT p.id, p.hora_inicio, p.hora_fin, p.ronda, p.ganador_id,
           j.id AS juego_id, j.nombre AS juego_nombre,
           ea.id AS equipo_a_id, ea.nombre AS equipo_a_nombre, ea.color AS equipo_a_color,
           eb.id AS equipo_b_id, eb.nombre AS equipo_b_nombre, eb.color AS equipo_b_color
    FROM partidos p
    JOIN juegos j ON j.id = p.juego_id
    JOIN equipos ea ON ea.id = p.equipo_a_id
    JOIN equipos eb ON eb.id = p.equipo_b_id
    ORDER BY p.hora_inicio ASC
  `;
  return NextResponse.json({ partidos });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validatePartidoInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [juego] = await sql`SELECT id FROM juegos WHERE id = ${data.juegoId}`;
  if (!juego) {
    return NextResponse.json({ error: "El juego seleccionado no existe." }, { status: 400 });
  }
  const equiposExisten = await sql`
    SELECT id FROM equipos WHERE id IN (${data.equipoAId}, ${data.equipoBId})
  `;
  if (equiposExisten.length !== 2) {
    return NextResponse.json({ error: "Alguno de los equipos no existe." }, { status: 400 });
  }

  const [partido] = await sql`
    INSERT INTO partidos (juego_id, equipo_a_id, equipo_b_id, hora_inicio, hora_fin, ronda, ganador_id)
    VALUES (${data.juegoId}, ${data.equipoAId}, ${data.equipoBId}, ${data.horaInicio.toISOString()}, ${data.horaFin.toISOString()}, ${data.ronda}, ${data.ganadorId})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, id: partido.id }, { status: 201 });
}
