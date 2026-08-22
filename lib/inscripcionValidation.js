const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInscripcionInput(body) {
  const nombreCompleto = String(body.nombreCompleto || "").trim();
  const email = String(body.email || "").trim();
  const telefono = String(body.telefono || "").trim();
  const categoria = String(body.categoria || "").trim();
  const equipoId = Number(body.equipoId);
  const edadRaw = body.edad;
  const edad =
    edadRaw === "" || edadRaw === undefined || edadRaw === null
      ? null
      : Number(edadRaw);

  if (!nombreCompleto || nombreCompleto.length > 150) {
    return { error: "El nombre completo es obligatorio." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "El correo electrónico no es válido." };
  }
  if (!telefono) {
    return { error: "El teléfono es obligatorio." };
  }
  if (!["nino", "adulto"].includes(categoria)) {
    return { error: "Selecciona una categoría válida." };
  }
  if (!Number.isInteger(equipoId) || equipoId <= 0) {
    return { error: "Selecciona un equipo válido." };
  }
  if (edad !== null && (!Number.isFinite(edad) || edad < 0 || edad > 120)) {
    return { error: "Edad no válida." };
  }

  return {
    data: { nombreCompleto, email, telefono, categoria, equipoId, edad },
  };
}
