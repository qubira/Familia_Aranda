import { sql } from "@/lib/db";

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const rows = await sql`
    SELECT i.nombre_completo, i.categoria, i.edad,
           i.created_at, e.nombre AS equipo
    FROM inscripciones i
    JOIN equipos e ON e.id = i.equipo_id
    ORDER BY e.nombre, i.nombre_completo
  `;

  const header = ["Equipo", "Nombre completo", "Categoría", "Edad", "Fecha de inscripción"];
  const lines = [header.map(csvEscape).join(",")];

  for (const r of rows) {
    lines.push(
      [
        r.equipo,
        r.nombre_completo,
        r.categoria,
        r.edad ?? "",
        new Date(r.created_at).toLocaleString("es-MX"),
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const csv = "﻿" + lines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscripciones.csv"`,
    },
  });
}
