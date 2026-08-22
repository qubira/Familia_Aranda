import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { validateImageFile } from "@/lib/imageValidation";

export async function GET() {
  const fotos = await sql`
    SELECT id, url, public_id, descripcion, created_at
    FROM fotos_evento
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ fotos });
}

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const descripcion = String(formData?.get("descripcion") || "").trim().slice(0, 200);

  const error = validateImageFile(file);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await uploadImage(buffer, "familia-aranda/galeria");
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Intenta de nuevo." },
      { status: 502 }
    );
  }

  const [foto] = await sql`
    INSERT INTO fotos_evento (url, public_id, descripcion)
    VALUES (${result.secure_url}, ${result.public_id}, ${descripcion || null})
    RETURNING id, url, public_id, descripcion, created_at
  `;

  return NextResponse.json({ ok: true, foto }, { status: 201 });
}
