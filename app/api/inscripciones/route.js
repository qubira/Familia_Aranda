import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const nombreCompleto = String(body.nombreCompleto || "").trim();
  const email = String(body.email || "").trim();
  const telefono = String(body.telefono || "").trim();
  const categoria = String(body.categoria || "").trim();
  const equipoId = Number(body.equipoId);
  const edadRaw = body.edad;
  const edad = edadRaw === "" || edadRaw === undefined || edadRaw === null
    ? null
    : Number(edadRaw);
  const fotoUrlRaw = String(body.fotoUrl || "").trim();
  const cloudinaryPrefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  const fotoUrl = fotoUrlRaw.startsWith(cloudinaryPrefix) ? fotoUrlRaw : null;

  if (!nombreCompleto || nombreCompleto.length > 150) {
    return NextResponse.json(
      { error: "El nombre completo es obligatorio." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "El correo electrónico no es válido." },
      { status: 400 }
    );
  }
  if (!telefono) {
    return NextResponse.json(
      { error: "El teléfono es obligatorio." },
      { status: 400 }
    );
  }
  if (!["nino", "adulto"].includes(categoria)) {
    return NextResponse.json(
      { error: "Selecciona una categoría válida." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(equipoId) || equipoId <= 0) {
    return NextResponse.json(
      { error: "Selecciona un equipo válido." },
      { status: 400 }
    );
  }
  if (edad !== null && (!Number.isFinite(edad) || edad < 0 || edad > 120)) {
    return NextResponse.json({ error: "Edad no válida." }, { status: 400 });
  }

  const equipoExiste = await sql`SELECT id FROM equipos WHERE id = ${equipoId}`;
  if (equipoExiste.length === 0) {
    return NextResponse.json(
      { error: "El equipo seleccionado no existe." },
      { status: 400 }
    );
  }

  const [inscripcion] = await sql`
    INSERT INTO inscripciones (equipo_id, nombre_completo, email, telefono, categoria, edad, foto_url)
    VALUES (${equipoId}, ${nombreCompleto}, ${email}, ${telefono}, ${categoria}, ${edad}, ${fotoUrl})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, id: inscripcion.id }, { status: 201 });
}
