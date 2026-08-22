"use client";

import { useEffect, useState } from "react";
import Countdown from "@/components/Countdown";
import Bracket from "@/components/Bracket";

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

export default function HomeContent({
  initialEquipos,
  initialInscritos,
  initialConfig,
  initialPartidos,
  initialActividades,
}) {
  const [equipos, setEquipos] = useState(initialEquipos);
  const [inscritos, setInscritos] = useState(initialInscritos);
  const [config, setConfig] = useState(initialConfig || {});
  const [partidos, setPartidos] = useState(initialPartidos || []);
  const [actividades, setActividades] = useState(initialActividades || []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [equiposRes, inscritosRes, configRes, partidosRes, actividadesRes] = await Promise.all([
          fetch("/api/equipos", { cache: "no-store" }),
          fetch("/api/inscritos", { cache: "no-store" }),
          fetch("/api/config", { cache: "no-store" }),
          fetch("/api/partidos", { cache: "no-store" }),
          fetch("/api/actividades", { cache: "no-store" }),
        ]);
        if (equiposRes.ok) {
          const data = await equiposRes.json();
          if (data.equipos) setEquipos(data.equipos);
        }
        if (inscritosRes.ok) {
          const data = await inscritosRes.json();
          if (data.inscritos) setInscritos(data.inscritos);
        }
        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) setConfig(data.config);
        }
        if (partidosRes.ok) {
          const data = await partidosRes.json();
          if (data.partidos) setPartidos(data.partidos);
        }
        if (actividadesRes.ok) {
          const data = await actividadesRes.json();
          if (data.actividades) setActividades(data.actividades);
        }
      } catch {
        // Silently retry on the next interval tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const scheduleItems = [
    ...partidos.map((p) => ({ ...p, tipo: "partido" })),
    ...actividades.map((a) => ({ ...a, tipo: "actividad" })),
  ].sort((a, b) => new Date(a.hora_inicio) - new Date(b.hora_inicio));

  const maxInscritos = Math.max(0, ...equipos.map((e) => e.inscritos));

  return (
    <>
      <section className="hero">
        <div className="hero-decor" aria-hidden="true">
          <img src="/img/classic-black-and-white-soccer-ball-isolated-on-white-and-transparent-background-png.webp" alt="" className="hero-decor-ball ball-soccer" />
          <img src="/img/basketball-ball-3d-render-png.webp" alt="" className="hero-decor-ball ball-basketball" />
          <img src="/img/ai-generated-volleyball-ball-isolated-on-transparent-background-free-png.webp" alt="" className="hero-decor-ball ball-volleyball" />
          <img src="/img/medal-awards-and-trophies-png.webp" alt="" className="hero-decor-trophy trophy-1" />
          <img src="/img/medal-awards-and-trophies-png.webp" alt="" className="hero-decor-trophy trophy-2" />
        </div>
        <div className="container">
          <span className="badge">🏆 Evento Deportivo Familiar</span>
          {config.evento_nombre ? (
            <h1>{config.evento_nombre}</h1>
          ) : (
            <h1>
              Evento Deportivo
              <br />
              Familiar <span className="accent">Aranda</span> 2026
            </h1>
          )}
          <p className="subtitle">
            Un día de deporte, competencia y unión familiar. Cada rama de la
            familia forma su propio equipo y compite por el trofeo del año.
          </p>
          {config.evento_fecha && <Countdown targetIso={config.evento_fecha} />}
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

      {config.evento_sede && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2>Ubicación</h2>
            <p className="lead">📍 {config.evento_sede}</p>
            <div className="map-embed">
              <iframe
                title="Ubicación del evento"
                src={`https://www.google.com/maps?q=${encodeURIComponent(config.evento_sede)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {scheduleItems.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2>Cronograma</h2>
            <p className="lead">Así se organizará el día del evento.</p>
            <div className="schedule-list">
              {scheduleItems.map((item) =>
                item.tipo === "partido" ? (
                  <div className="schedule-item" key={`partido-${item.id}`}>
                    <div className="schedule-time">
                      <span className="schedule-time-main">
                        {new Date(item.hora_inicio).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="schedule-time-sub">
                        {new Date(item.hora_inicio).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    {item.juego_imagen && (
                      <img src={item.juego_imagen} alt={item.juego_nombre} className="schedule-juego-img" />
                    )}
                    <div className="schedule-info">
                      <span className="schedule-juego">{item.juego_nombre}</span>
                      <div className="schedule-vs">
                        <span className="partido-equipo" style={{ "--team-color": item.equipo_a_color }}>
                          {item.equipo_a_nombre}
                        </span>
                        <span className="partido-vs-label">VS</span>
                        <span className="partido-equipo" style={{ "--team-color": item.equipo_b_color }}>
                          {item.equipo_b_nombre}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="schedule-item schedule-item-actividad" key={`actividad-${item.id}`}>
                    <div className="schedule-time">
                      <span className="schedule-time-main">
                        {new Date(item.hora_inicio).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="schedule-time-sub">
                        {new Date(item.hora_inicio).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <div className="schedule-info">
                      <span className="schedule-juego">{item.nombre}</span>
                      {item.hora_fin && (
                        <span className="schedule-actividad-fin">
                          hasta las{" "}
                          {new Date(item.hora_fin).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {partidos.some((p) => p.ronda) && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2>Cuadro de eliminación directa</h2>
            <p className="lead">Quién avanza y quién se corona campeón.</p>
            <Bracket partidos={partidos} />
          </div>
        </section>
      )}

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
