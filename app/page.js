import { sql } from "@/lib/db";

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
  const totalInscritos = equipos.reduce((acc, e) => acc + e.inscritos, 0);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <span className="badge">Evento Deportivo Familiar</span>
          <h1>Evento Deportivo Familiar Aranda 2026</h1>
          <p className="subtitle">
            Un día de deporte, competencia y unión familiar. Cada rama de la
            familia forma su propio equipo y compite por el trofeo del año.
          </p>
          <div className="hero-meta">
            <span>📅 Fecha por confirmar</span>
            <span>📍 Sede por confirmar</span>
            <span>👨‍👩‍👧‍👦 {totalInscritos} inscritos hasta ahora</span>
          </div>
          <a href="/inscripcion" className="btn btn-accent">
            Inscribirme ahora
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Los equipos</h2>
          <p className="lead">
            Elige tu equipo al inscribirte. ¡Cada familia contra las demás,
            todos representando el mismo apellido!
          </p>
          <div className="teams-grid">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="team-card"
                style={{ "--team-color": equipo.color }}
              >
                {equipo.logo_url ? (
                  <img src={equipo.logo_url} alt={equipo.nombre} className="team-logo" />
                ) : (
                  <div className="team-dot" />
                )}
                <h3>{equipo.nombre}</h3>
                <p>{equipo.descripcion}</p>
                <span className="team-count">{equipo.inscritos}</span>
                <span className="team-count-label">inscritos</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <a href="/inscripcion" className="btn btn-primary">
            Quiero inscribir a mi familiar
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
