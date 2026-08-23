import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { validateImageFile } from "@/lib/imageValidation";
import { logAudit } from "@/lib/auditLog";

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const equipoId = Number(formData?.get("equipoId"));

  if (!Number.isInteger(equipoId) || equipoId <= 0) {
    return NextResponse.json({ error: "Equipo inválido." }, { status: 400 });
  }

  const error = validateImageFile(file);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [equipo] = await sql`SELECT id, logo_public_id FROM equipos WHERE id = ${equipoId}`;
  if (!equipo) {
    return NextResponse.json({ error: "El equipo no existe." }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await uploadImage(buffer, "familia-aranda/equipos");
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Intenta de nuevo." },
      { status: 502 }
    );
  }

  await sql`
    UPDATE equipos SET logo_url = ${result.secure_url}, logo_public_id = ${result.public_id}
    WHERE id = ${equipoId}
  `;

  if (equipo.logo_public_id) {
    deleteImage(equipo.logo_public_id).catch(() => {});
  }

  await logAudit(request, {
    accion: "editar",
    entidad: "equipo",
    entidadId: equipoId,
    detalle: "Actualizó el logo del equipo",
  });

  return NextResponse.json({ ok: true, url: result.secure_url });
}
