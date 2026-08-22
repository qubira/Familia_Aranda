"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [authState, setAuthState] = useState("checking"); // checking | out | in
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [inscripciones, setInscripciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(null);
  const [galeriaUploading, setGaleriaUploading] = useState(false);
  const [galeriaDescripcion, setGaleriaDescripcion] = useState("");

  async function loadAll() {
    setLoading(true);
    const res = await fetch("/api/admin/inscripciones");
    if (res.status === 401) {
      setAuthState("out");
      setLoading(false);
      return;
    }
    const [inscripcionesData, equiposData, galeriaData] = await Promise.all([
      res.json(),
      fetch("/api/equipos").then((r) => r.json()),
      fetch("/api/admin/galeria").then((r) => r.json()),
    ]);
    setInscripciones(inscripcionesData.inscripciones || []);
    setEquipos(equiposData.equipos || []);
    setGaleria(galeriaData.fotos || []);
    setAuthState("in");
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Contraseña incorrecta.");
      return;
    }
    setPassword("");
    await loadAll();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthState("out");
    setInscripciones([]);
    setEquipos([]);
    setGaleria([]);
  }

  async function handleLogoChange(equipoId, file) {
    if (!file) return;
    setLogoUploading(equipoId);
    const body = new FormData();
    body.append("file", file);
    body.append("equipoId", equipoId);
    const res = await fetch("/api/admin/equipos/logo", { method: "POST", body });
    if (res.ok) {
      const equiposData = await fetch("/api/equipos").then((r) => r.json());
      setEquipos(equiposData.equipos || []);
    }
    setLogoUploading(null);
  }

  async function handleGaleriaUpload(e) {
    e.preventDefault();
    const file = e.target.elements.galeriaFile.files?.[0];
    if (!file) return;
    setGaleriaUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("descripcion", galeriaDescripcion);
    const res = await fetch("/api/admin/galeria", { method: "POST", body });
    if (res.ok) {
      const { foto } = await res.json();
      setGaleria((g) => [foto, ...g]);
      setGaleriaDescripcion("");
      e.target.reset();
    }
    setGaleriaUploading(false);
  }

  async function handleGaleriaDelete(id) {
    setGaleria((g) => g.filter((f) => f.id !== id));
    await fetch(`/api/admin/galeria/${id}`, { method: "DELETE" });
  }

  if (authState === "checking") {
    return (
      <main className="section">
        <div className="container" style={{ textAlign: "center" }}>
          Cargando...
        </div>
      </main>
    );
  }

  if (authState === "out") {
    return (
      <main className="section">
        <div className="container">
          <div className="admin-login">
            <h2 style={{ textAlign: "center", marginTop: 0 }}>Panel de organizadores</h2>
            {loginError && <div className="alert alert-error">{loginError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Entrar
              </button>
            </form>
            <div style={{ textAlign: "center" }}>
              <a href="/" className="link-back">
                ← Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const porEquipo = inscripciones.reduce((acc, i) => {
    acc[i.equipo] = (acc[i.equipo] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="section">
      <div className="container">
        <div className="admin-header">
          <h2 style={{ margin: 0 }}>Panel de organizadores</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/api/admin/export" className="btn btn-primary">
              Exportar CSV
            </a>
            <button onClick={handleLogout} className="btn btn-accent">
              Cerrar sesión
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="admin-section">
              <h3>Inscripciones ({inscripciones.length})</h3>
              <div className="admin-stats">
                {Object.entries(porEquipo).map(([equipo, count]) => (
                  <div className="stat-card" key={equipo}>
                    <div className="num">{count}</div>
                    <div className="label">{equipo}</div>
                  </div>
                ))}
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Equipo</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Categoría</th>
                      <th>Edad</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscripciones.map((i) => (
                      <tr key={i.id}>
                        <td>
                          {i.foto_url ? (
                            <img src={i.foto_url} alt="" className="thumb" />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{i.equipo}</td>
                        <td>{i.nombre_completo}</td>
                        <td>{i.email}</td>
                        <td>{i.telefono}</td>
                        <td>{i.categoria === "nino" ? "Niño" : "Adulto"}</td>
                        <td>{i.edad ?? "—"}</td>
                        <td>{new Date(i.created_at).toLocaleString("es-MX")}</td>
                      </tr>
                    ))}
                    {inscripciones.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)" }}>
                          Aún no hay inscripciones.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-section">
              <h3>Logos de equipos</h3>
              {equipos.map((equipo) => (
                <div className="equipo-manage-card" key={equipo.id}>
                  {equipo.logo_url ? (
                    <img src={equipo.logo_url} alt={equipo.nombre} style={{ borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div className="team-dot" style={{ "--team-color": equipo.color }} />
                  )}
                  <span className="equipo-nombre">{equipo.nombre}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={logoUploading === equipo.id}
                    onChange={(e) => handleLogoChange(equipo.id, e.target.files?.[0])}
                  />
                  {logoUploading === equipo.id && <span className="hint">Subiendo...</span>}
                </div>
              ))}
            </div>

            <div className="admin-section">
              <h3>Galería del evento ({galeria.length})</h3>
              <form onSubmit={handleGaleriaUpload} className="form-row" style={{ marginBottom: 24, alignItems: "end" }}>
                <div className="form-group">
                  <label htmlFor="galeriaFile">Nueva foto</label>
                  <input id="galeriaFile" name="galeriaFile" type="file" accept="image/*" required />
                </div>
                <div className="form-group">
                  <label htmlFor="galeriaDescripcion">Descripción (opcional)</label>
                  <input
                    id="galeriaDescripcion"
                    type="text"
                    maxLength={200}
                    value={galeriaDescripcion}
                    onChange={(e) => setGaleriaDescripcion(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary" disabled={galeriaUploading}>
                    {galeriaUploading ? "Subiendo..." : "Subir foto"}
                  </button>
                </div>
              </form>

              <div className="gallery-grid">
                {galeria.map((foto) => (
                  <div className="gallery-item gallery-admin-item" key={foto.id}>
                    <button className="delete-btn" onClick={() => handleGaleriaDelete(foto.id)}>
                      Eliminar
                    </button>
                    <img src={foto.url} alt={foto.descripcion || ""} />
                    {foto.descripcion && <div className="caption">{foto.descripcion}</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/" className="link-back">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
