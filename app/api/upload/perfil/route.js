import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { validateImageFile } from "@/lib/imageValidation";

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  const error = validateImageFile(file);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await uploadImage(buffer, "familia-aranda/perfiles");
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Intenta de nuevo." },
      { status: 502 }
    );
  }
}
