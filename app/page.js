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
    ORDER BY e.id, i.created_at ASC
  `;
  return rows;
}

async function getConfig() {
  const [config] = await sql`SELECT evento_nombre, evento_fecha, evento_sede FROM configuracion WHERE id = 1`;
  return config || {};
}

async function getPartidos() {
  const rows = await sql`
    SELECT p.id, p.hora_inicio, p.hora_fin,
           j.nombre AS juego_nombre, j.imagen_url AS juego_imagen,
           ea.nombre AS equipo_a_nombre, ea.color AS equipo_a_color,
           eb.nombre AS equipo_b_nombre, eb.color AS equipo_b_color
    FROM partidos p
    JOIN juegos j ON j.id = p.juego_id
    JOIN equipos ea ON ea.id = p.equipo_a_id
    JOIN equipos eb ON eb.id = p.equipo_b_id
    ORDER BY p.hora_inicio ASC
  `;
  return rows;
}

export default async function Home() {
  const [equipos, inscritos, config, partidos] = await Promise.all([
    getEquipos(),
    getInscritos(),
    getConfig(),
    getPartidos(),
  ]);

  return (
    <main>
      <HomeContent
        initialEquipos={equipos}
        initialInscritos={inscritos}
        initialConfig={config}
        initialPartidos={partidos}
      />

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
