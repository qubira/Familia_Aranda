import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateInscripcionInput } from "@/lib/inscripcionValidation";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { error, data } = validateInscripcionInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const fotoUrlRaw = String(body.fotoUrl || "").trim();
  const cloudinaryPrefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  const fotoUrl = fotoUrlRaw.startsWith(cloudinaryPrefix) ? fotoUrlRaw : null;

  const equipoExiste = await sql`SELECT id FROM equipos WHERE id = ${data.equipoId}`;
  if (equipoExiste.length === 0) {
    return NextResponse.json(
      { error: "El equipo seleccionado no existe." },
      { status: 400 }
    );
  }

  const [inscripcion] = await sql`
    INSERT INTO inscripciones (equipo_id, nombre_completo, categoria, edad, foto_url)
    VALUES (${data.equipoId}, ${data.nombreCompleto}, ${data.categoria}, ${data.edad}, ${fotoUrl})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, id: inscripcion.id }, { status: 201 });
}
