import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(request, { params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const [foto] = await sql`DELETE FROM fotos_evento WHERE id = ${id} RETURNING public_id`;
  if (!foto) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  deleteImage(foto.public_id).catch(() => {});

  return NextResponse.json({ ok: true });
}
