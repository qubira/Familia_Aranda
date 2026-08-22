import { sql } from "@/lib/db";
import HomeContent from "@/components/HomeContent";

export const dynamic = "force-dynamic";

async function getEquipos() {
  const rows = await sql`
    SELECT e.id, e.nombre, e.color, e.descripcion, e.logo_url, COUNT(i.id)::int AS inscritos
    FROM equipos e
    LEFT JOIN inscripciones i ON i.equipo_id = e.id
    GROUP BY e.id
    ORDER BY e.id
  `;
  return rows;
}

async function getInscritos() {
  const rows = await sql`
    SELECT i.id, i.nombre_completo, i.foto_url, e.nombre AS equipo, e.color AS equipo_color
    FROM inscripciones i
    JOIN equipos e ON e.id = i.equipo_id
    ORDER BY i.created_at DESC
  `;
  return rows;
}

export default async function Home() {
  const [equipos, inscritos] = await Promise.all([getEquipos(), getInscritos()]);

  return (
    <main>
      <HomeContent initialEquipos={equipos} initialInscritos={inscritos} />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <a href="/inscripcion" className="btn btn-primary">
            🏅 Quiero inscribir a mi familiar
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          Evento Deportivo Familiar Aranda · <a href="/galeria">Galería</a> ·{" "}
          <a href="/admin">Panel organizadores</a>
        </div>
      </footer>
    </main>
  );
}
