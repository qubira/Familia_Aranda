"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 15000;

function getInitials(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function HomeContent({ initialEquipos, initialInscritos }) {
  const [equipos, setEquipos] = useState(initialEquipos);
  const [inscritos, setInscritos] = useState(initialInscritos);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [equiposRes, inscritosRes] = await Promise.all([
          fetch("/api/equipos", { cache: "no-store" }),
          fetch("/api/inscritos", { cache: "no-store" }),
        ]);
        if (equiposRes.ok) {
          const data = await equiposRes.json();
          if (data.equipos) setEquipos(data.equipos);
        }
        if (inscritosRes.ok) {
          const data = await inscritosRes.json();
          if (data.inscritos) setInscritos(data.inscritos);
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

      {inscritos.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2>Participantes</h2>
            <p className="lead">Quienes ya se inscribieron para competir.</p>
            <div className="participants-grid">
              {inscritos.map((p) => (
                <div className="participant-card" key={p.id}>
                  {p.foto_url ? (
                    <img
                      src={p.foto_url}
                      alt={p.nombre_completo}
                      className="participant-avatar"
                      style={{ "--team-color": p.equipo_color }}
                    />
                  ) : (
                    <div
                      className="participant-avatar participant-avatar-placeholder"
                      style={{ "--team-color": p.equipo_color }}
                    >
                      {getInitials(p.nombre_completo)}
                    </div>
                  )}
                  <span className="participant-name">{p.nombre_completo}</span>
                  <span className="participant-team" style={{ "--team-color": p.equipo_color }}>
                    {p.equipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
