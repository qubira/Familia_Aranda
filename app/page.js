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

export default async function Home() {
  const equipos = await getEquipos();

  return (
    <main>
      <HomeContent initialEquipos={equipos} />

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
