const RONDAS_VALIDAS = ["semifinal", "final"];

export function validatePartidoInput(body) {
  const juegoId = Number(body.juegoId);
  const equipoAId = Number(body.equipoAId);
  const equipoBId = Number(body.equipoBId);
  const horaInicio = body.horaInicio ? new Date(body.horaInicio) : null;
  const horaFin = body.horaFin ? new Date(body.horaFin) : null;
  const ronda = body.ronda ? String(body.ronda).trim() : null;
  const ganadorId = body.ganadorId ? Number(body.ganadorId) : null;

  if (!Number.isInteger(juegoId) || juegoId <= 0) {
    return { error: "Selecciona un juego válido." };
  }
  if (!Number.isInteger(equipoAId) || equipoAId <= 0 || !Number.isInteger(equipoBId) || equipoBId <= 0) {
    return { error: "Selecciona los dos equipos." };
  }
  if (equipoAId === equipoBId) {
    return { error: "Los dos equipos deben ser distintos." };
  }
  if (!horaInicio || Number.isNaN(horaInicio.getTime())) {
    return { error: "La hora de inicio no es válida." };
  }
  if (!horaFin || Number.isNaN(horaFin.getTime())) {
    return { error: "La hora de fin no es válida." };
  }
  if (horaFin <= horaInicio) {
    return { error: "La hora de fin debe ser posterior a la hora de inicio." };
  }
  if (ronda && !RONDAS_VALIDAS.includes(ronda)) {
    return { error: "Ronda inválida." };
  }
  if (ganadorId && ganadorId !== equipoAId && ganadorId !== equipoBId) {
    return { error: "El ganador debe ser uno de los dos equipos del partido." };
  }

  return { data: { juegoId, equipoAId, equipoBId, horaInicio, horaFin, ronda, ganadorId } };
}
