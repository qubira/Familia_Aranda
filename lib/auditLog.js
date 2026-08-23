import { sql } from "@/lib/db";

function parseDispositivo(userAgent) {
  if (!userAgent) return "Desconocido";
  if (/ipad/i.test(userAgent)) return "iPad";
  if (/iphone/i.test(userAgent)) return "iPhone";
  if (/android/i.test(userAgent)) {
    const match = userAgent.match(/android[^;]*;\s*([^;)]+)/i);
    return match ? `Android (${match[1].trim()})` : "Android";
  }
  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os x/i.test(userAgent)) return "Mac";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Otro";
}

function getClientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "desconocida";
}

export async function logAudit(request, { accion, entidad, entidadId = null, detalle = null }) {
  try {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";
    const dispositivo = parseDispositivo(userAgent);

    await sql`
      INSERT INTO bitacora (accion, entidad, entidad_id, detalle, ip, dispositivo, user_agent)
      VALUES (${accion}, ${entidad}, ${entidadId}, ${detalle}, ${ip}, ${dispositivo}, ${userAgent})
    `;
  } catch (err) {
    // Nunca dejar que un fallo al registrar la bitacora rompa la accion real.
    console.error("Error al registrar bitacora:", err);
  }
}
