"use client";

import { useEffect, useState } from "react";

function getRemaining(targetIso) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function Countdown({ targetIso }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetIso));

  useEffect(() => {
    setRemaining(getRemaining(targetIso));
    const interval = setInterval(() => setRemaining(getRemaining(targetIso)), 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!remaining) {
    return <div className="countdown-today">🎉 ¡Hoy es el gran día!</div>;
  }

  const units = [
    { label: "Días", value: remaining.days },
    { label: "Horas", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Seg", value: remaining.seconds },
  ];

  return (
    <div className="countdown">
      {units.map((u) => (
        <div className="countdown-box" key={u.label}>
          <span className="countdown-value">{String(u.value).padStart(2, "0")}</span>
          <span className="countdown-label">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
