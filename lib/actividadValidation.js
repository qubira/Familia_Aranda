export function validateActividadInput(body) {
  const nombre = String(body.nombre || "").trim();
  const horaInicio = body.horaInicio ? new Date(body.horaInicio) : null;
  const horaFin = body.horaFin ? new Date(body.horaFin) : null;

  if (!nombre || nombre.length > 150) {
    return { error: "El nombre es obligatorio." };
  }
  if (!horaInicio || Number.isNaN(horaInicio.getTime())) {
    return { error: "La hora no es válida." };
  }
  if (horaFin && Number.isNaN(horaFin.getTime())) {
    return { error: "La hora de fin no es válida." };
  }
  if (horaFin && horaFin <= horaInicio) {
    return { error: "La hora de fin debe ser posterior a la hora de inicio." };
  }

  return { data: { nombre, horaInicio, horaFin } };
}
