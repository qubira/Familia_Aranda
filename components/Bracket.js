function MatchBox({ p }) {
  return (
    <div className="bracket-match">
      <div
        className={`bracket-team${p.ganador_id === p.equipo_a_id ? " winner" : ""}`}
        style={{ "--team-color": p.equipo_a_color }}
      >
        <span>{p.equipo_a_nombre}</span>
        {p.ganador_id === p.equipo_a_id && <span className="check">✓</span>}
      </div>
      <div
        className={`bracket-team${p.ganador_id === p.equipo_b_id ? " winner" : ""}`}
        style={{ "--team-color": p.equipo_b_color }}
      >
        <span>{p.equipo_b_nombre}</span>
        {p.ganador_id === p.equipo_b_id && <span className="check">✓</span>}
      </div>
    </div>
  );
}

export default function Bracket({ partidos }) {
  const semifinales = partidos.filter((p) => p.ronda === "semifinal");
  const final = partidos.find((p) => p.ronda === "final");

  if (semifinales.length === 0 && !final) return null;

  const campeonId = final?.ganador_id;
  const campeonNombre =
    campeonId === final?.equipo_a_id
      ? final.equipo_a_nombre
      : campeonId === final?.equipo_b_id
        ? final.equipo_b_nombre
        : null;
  const campeonColor =
    campeonId === final?.equipo_a_id
      ? final.equipo_a_color
      : campeonId === final?.equipo_b_id
        ? final.equipo_b_color
        : null;

  return (
    <div className="bracket-wrap">
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
          🏆 Campeón: <span style={{ color: campeonColor }}>{campeonNombre}</span>
        </div>
      )}
    </div>
  );
}
