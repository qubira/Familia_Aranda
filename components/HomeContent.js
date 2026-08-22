"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 15000;

export default function HomeContent({ initialEquipos }) {
  const [equipos, setEquipos] = useState(initialEquipos);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/equipos", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.equipos) setEquipos(data.equipos);
        }
      } catch {
        // Silently retry on the next interval tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const totalInscritos = equipos.reduce((acc, e) => acc + e.inscritos, 0);
  const maxInscritos = Math.max(0, ...equipos.map((e) => e.inscritos));

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">🏆 Evento Deportivo Familiar</span>
          <h1>
            Evento Deportivo
            <br />
            Familiar <span className="accent">Aranda</span> 2026
          </h1>
          <p className="subtitle">
            Un día de deporte, competencia y unión familiar. Cada rama de la
            familia forma su propio equipo y compite por el trofeo del año.
          </p>
          <div className="hero-meta">
            <span>📅 Fecha por confirmar</span>
            <span>📍 Sede por confirmar</span>
            <span>
              <span className="live-dot" /> {totalInscritos} inscritos hasta ahora
            </span>
          </div>
          <a href="/inscripcion" className="btn btn-accent">
            ⚡ Inscribirme ahora
          </a>
        </div>
      </section>

      <div className="section-divider" />

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
                className={`team-card${equipo.inscritos > 0 && equipo.inscritos === maxInscritos ? " leader" : ""}`}
                style={{ "--team-color": equipo.color }}
              >
                {equipo.inscritos > 0 && equipo.inscritos === maxInscritos && (
                  <span className="leader-crown">👑 Líder</span>
                )}
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
    </>
  );
}
