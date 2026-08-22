import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getFotos() {
  return sql`
    SELECT id, url, descripcion, created_at
    FROM fotos_evento
    ORDER BY created_at DESC
  `;
}

export default async function GaleriaPage() {
  const fotos = await getFotos();

  return (
    <main className="section">
      <div className="container">
        <h2>Galería del evento</h2>
        <p className="lead">Los mejores momentos del Evento Deportivo Familiar Aranda.</p>

        {fotos.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--muted)" }}>
            Todavía no hay fotos publicadas. ¡Vuelve pronto!
          </p>
        ) : (
          <div className="gallery-grid">
            {fotos.map((foto) => (
              <div className="gallery-item" key={foto.id}>
                <img src={foto.url} alt={foto.descripcion || "Foto del evento"} loading="lazy" />
                {foto.descripcion && <div className="caption">{foto.descripcion}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/" className="link-back">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
