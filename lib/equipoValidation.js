const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function validateEquipoInput(body) {
  const nombre = String(body.nombre || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  const color = String(body.color || "").trim();

  if (!nombre || nombre.length > 100) {
    return { error: "El nombre del equipo es obligatorio." };
  }
  if (!HEX_COLOR_RE.test(color)) {
    return { error: "Color inválido." };
  }
  if (descripcion.length > 300) {
    return { error: "La descripción es demasiado larga." };
  }

  return { data: { nombre, descripcion: descripcion || null, color } };
}
