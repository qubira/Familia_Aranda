function TeamBadge({ nombre, color, logo }) {
  return logo ? (
    <img src={logo} alt={nombre} className="bracket-badge" style={{ "--team-color": color }} />
  ) : (
    <span className="bracket-badge bracket-badge-dot" style={{ "--team-color": color }} />
  );
}

function MatchBox({ p }) {
  return (
    <div className="bracket-match">
      <div className={`bracket-team${p.ganador_id === p.equipo_a_id ? " winner" : ""}`}>
        <TeamBadge nombre={p.equipo_a_nombre} color={p.equipo_a_color} logo={p.equipo_a_logo} />
        <span className="bracket-team-name">{p.equipo_a_nombre}</span>
        {p.ganador_id === p.equipo_a_id && <span className="check">✓</span>}
      </div>
      <div className="bracket-match-vs">VS</div>
      <div className={`bracket-team${p.ganador_id === p.equipo_b_id ? " winner" : ""}`}>
        <TeamBadge nombre={p.equipo_b_nombre} color={p.equipo_b_color} logo={p.equipo_b_logo} />
        <span className="bracket-team-name">{p.equipo_b_nombre}</span>
        {p.ganador_id === p.equipo_b_id && <span className="check">✓</span>}
      </div>
    </div>
  );
}

export default function Bracket({ partidos }) {
  const semifinales = partidos.filter((p) => p.ronda === "semifinal");
  const final = partidos.find((p) => p.ronda === "final");

  if (semifinales.length === 0 && !final) return null;

  let campeonNombre = null;
  let campeonLogo = null;
  let campeonColor = null;

  if (final && final.ganador_id) {
    const esEquipoA = final.ganador_id === final.equipo_a_id;
    campeonNombre = esEquipoA ? final.equipo_a_nombre : final.equipo_b_nombre;
    campeonLogo = esEquipoA ? final.equipo_a_logo : final.equipo_b_logo;
    campeonColor = esEquipoA ? final.equipo_a_color : final.equipo_b_color;
  }

  return (
    <div className="bracket-panel">
      <div className="bracket-panel-stripes" />
      <div className="bracket-panel-inner">
        <div className="bracket">
          {semifinales.length > 0 && (
            <div className="bracket-round">
              <div className="bracket-round-label">Semifinal</div>
              <div className={`bracket-connector-group${semifinales.length === 2 ? " connected" : ""}`}>
                {semifinales.map((p) => (
                  <MatchBox key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}
          {final && (
            <div className="bracket-round bracket-round-final">
              <div className="bracket-round-label">Final</div>
              <MatchBox p={final} />
            </div>
          )}
        </div>
        {campeonNombre && (
          <div className="bracket-champion">
            <TeamBadge nombre={campeonNombre} color={campeonColor} logo={campeonLogo} />
            <span>
              🏆 Campeón: <strong>{campeonNombre}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
