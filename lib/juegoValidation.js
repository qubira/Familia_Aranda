export function validateJuegoInput(body) {
  const nombre = String(body.nombre || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  const estado = String(body.estado || "propuesto").trim();

  if (!nombre || nombre.length > 150) {
    return { error: "El nombre del juego es obligatorio." };
  }
  if (descripcion.length > 500) {
    return { error: "La descripción es demasiado larga." };
  }
  if (!["propuesto", "confirmado"].includes(estado)) {
    return { error: "Estado inválido." };
  }

  return { data: { nombre, descripcion: descripcion || null, estado } };
}
