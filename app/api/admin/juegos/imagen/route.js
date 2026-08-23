import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { validateImageFile } from "@/lib/imageValidation";
import { logAudit } from "@/lib/auditLog";

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const juegoId = Number(formData?.get("juegoId"));

  if (!Number.isInteger(juegoId) || juegoId <= 0) {
    return NextResponse.json({ error: "Juego inválido." }, { status: 400 });
  }

  const error = validateImageFile(file);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [juego] = await sql`SELECT id, imagen_public_id FROM juegos WHERE id = ${juegoId}`;
  if (!juego) {
    return NextResponse.json({ error: "El juego no existe." }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await uploadImage(buffer, "familia-aranda/juegos");
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Intenta de nuevo." },
      { status: 502 }
    );
  }

  await sql`
    UPDATE juegos SET imagen_url = ${result.secure_url}, imagen_public_id = ${result.public_id}
    WHERE id = ${juegoId}
  `;

  if (juego.imagen_public_id) {
    deleteImage(juego.imagen_public_id).catch(() => {});
  }

  await logAudit(request, {
    accion: "editar",
    entidad: "juego",
    entidadId: juegoId,
    detalle: "Actualizó la imagen del juego",
  });

  return NextResponse.json({ ok: true, url: result.secure_url });
}
