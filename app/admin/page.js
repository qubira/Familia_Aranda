"use client";

import { useEffect, useMemo, useState } from "react";

const emptyEditForm = {
  nombreCompleto: "",
  email: "",
  telefono: "",
  categoria: "adulto",
  edad: "",
  equipoId: "",
};

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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEquipoId, setFilterEquipoId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  function startEdit(i) {
    setEditingId(i.id);
    setEditError("");
    setEditForm({
      nombreCompleto: i.nombre_completo,
      email: i.email,
      telefono: i.telefono,
      categoria: i.categoria,
      edad: i.edad ?? "",
      equipoId: String(equipos.find((e) => e.nombre === i.equipo)?.id || ""),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyEditForm);
    setEditError("");
  }

  async function saveEdit(id) {
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await fetch(`/api/admin/inscripciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          equipoId: Number(editForm.equipoId),
          edad: editForm.edad === "" ? null : Number(editForm.edad),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "No se pudo guardar.");
        setSavingEdit(false);
        return;
      }
      await loadAll();
      cancelEdit();
    } catch {
      setEditError("No se pudo conectar con el servidor.");
    }
    setSavingEdit(false);
  }

  async function handleDeleteInscripcion(id, nombre) {
    if (!window.confirm(`¿Eliminar la inscripción de ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setInscripciones((list) => list.filter((i) => i.id !== id));
    await fetch(`/api/admin/inscripciones/${id}`, { method: "DELETE" });
  }

  const filteredInscripciones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return inscripciones.filter((i) => {
      const matchesEquipo = !filterEquipoId || String(i.equipo) === filterEquipoId;
      const matchesTerm =
        !term ||
        i.nombre_completo.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term);
      return matchesEquipo && matchesTerm;
    });
  }, [inscripciones, searchTerm, filterEquipoId]);

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
            <h2 style={{ textAlign: "center", marginTop: 0 }}>🏆 Panel de organizadores</h2>
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

  const porEquipo = equipos.map((equipo) => ({
    ...equipo,
    count: inscripciones.filter((i) => i.equipo === equipo.nombre).length,
  }));
  const maxPorEquipo = Math.max(1, ...porEquipo.map((e) => e.count));

  const ninos = inscripciones.filter((i) => i.categoria === "nino").length;
  const adultos = inscripciones.filter((i) => i.categoria === "adulto").length;
  const maxCategoria = Math.max(1, ninos, adultos);

  const porDia = inscripciones.reduce((acc, i) => {
    const dia = new Date(i.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    acc[dia] = (acc[dia] || 0) + 1;
    return acc;
  }, {});
  const diasOrdenados = Object.keys(porDia);
  const maxPorDia = Math.max(1, ...Object.values(porDia));

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
              <h3>📊 Dashboard</h3>
              <div className="dashboard-charts">
                <div className="chart-card">
                  <h4>Inscritos por equipo</h4>
                  {porEquipo.length === 0 ? (
                    <p className="empty-chart">Sin datos todavía.</p>
                  ) : (
                    porEquipo.map((e) => (
                      <div className="chart-bar-row" key={e.id}>
                        <span className="chart-bar-label">{e.nombre}</span>
                        <div className="chart-bar-track">
                          <div
                            className="chart-bar-fill"
                            style={{
                              width: `${(e.count / maxPorEquipo) * 100}%`,
                              "--bar-color": e.color,
                            }}
                          />
                        </div>
                        <span className="chart-bar-value">{e.count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="chart-card">
                  <h4>Niños vs. adultos</h4>
                  {inscripciones.length === 0 ? (
                    <p className="empty-chart">Sin datos todavía.</p>
                  ) : (
                    <>
                      <div className="chart-bar-row">
                        <span className="chart-bar-label">Niños</span>
                        <div className="chart-bar-track">
                          <div
                            className="chart-bar-fill"
                            style={{ width: `${(ninos / maxCategoria) * 100}%`, "--bar-color": "var(--field)" }}
                          />
                        </div>
                        <span className="chart-bar-value">{ninos}</span>
                      </div>
                      <div className="chart-bar-row">
                        <span className="chart-bar-label">Adultos</span>
                        <div className="chart-bar-track">
                          <div
                            className="chart-bar-fill"
                            style={{ width: `${(adultos / maxCategoria) * 100}%`, "--bar-color": "var(--navy)" }}
                          />
                        </div>
                        <span className="chart-bar-value">{adultos}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="chart-card">
                  <h4>Inscripciones por día</h4>
                  {diasOrdenados.length === 0 ? (
                    <p className="empty-chart">Sin datos todavía.</p>
                  ) : (
                    <div className="day-chart">
                      {diasOrdenados.map((dia) => (
                        <div className="day-chart-col" key={dia}>
                          <span className="day-chart-count">{porDia[dia]}</span>
                          <div
                            className="day-chart-bar"
                            style={{ height: `${(porDia[dia] / maxPorDia) * 80}px` }}
                          />
                          <span className="day-chart-label">{dia}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-section">
              <h3>Inscripciones ({filteredInscripciones.length} de {inscripciones.length})</h3>

              <div className="filter-bar">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={filterEquipoId} onChange={(e) => setFilterEquipoId(e.target.value)}>
                  <option value="">Todos los equipos</option>
                  {equipos.map((eq) => (
                    <option key={eq.id} value={eq.nombre}>
                      {eq.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {editError && <div className="alert alert-error">{editError}</div>}

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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInscripciones.map((i) =>
                      editingId === i.id ? (
                        <tr key={i.id}>
                          <td>{i.foto_url ? <img src={i.foto_url} alt="" className="thumb" /> : "—"}</td>
                          <td className="edit-cell">
                            <select
                              value={editForm.equipoId}
                              onChange={(e) => setEditForm((f) => ({ ...f, equipoId: e.target.value }))}
                            >
                              {equipos.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                  {eq.nombre}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="edit-cell">
                            <input
                              value={editForm.nombreCompleto}
                              onChange={(e) => setEditForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                            />
                          </td>
                          <td className="edit-cell">
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            />
                          </td>
                          <td className="edit-cell">
                            <input
                              value={editForm.telefono}
                              onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))}
                            />
                          </td>
                          <td className="edit-cell">
                            <select
                              value={editForm.categoria}
                              onChange={(e) => setEditForm((f) => ({ ...f, categoria: e.target.value }))}
                            >
                              <option value="adulto">Adulto</option>
                              <option value="nino">Niño</option>
                            </select>
                          </td>
                          <td className="edit-cell">
                            <input
                              type="number"
                              min="0"
                              max="120"
                              value={editForm.edad}
                              onChange={(e) => setEditForm((f) => ({ ...f, edad: e.target.value }))}
                            />
                          </td>
                          <td>{new Date(i.created_at).toLocaleDateString("es-MX")}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="btn-small btn-save"
                                onClick={() => saveEdit(i.id)}
                                disabled={savingEdit}
                              >
                                {savingEdit ? "..." : "Guardar"}
                              </button>
                              <button className="btn-small btn-cancel" onClick={cancelEdit} disabled={savingEdit}>
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={i.id}>
                          <td>{i.foto_url ? <img src={i.foto_url} alt="" className="thumb" /> : "—"}</td>
                          <td>{i.equipo}</td>
                          <td>{i.nombre_completo}</td>
                          <td>{i.email}</td>
                          <td>{i.telefono}</td>
                          <td>{i.categoria === "nino" ? "Niño" : "Adulto"}</td>
                          <td>{i.edad ?? "—"}</td>
                          <td>{new Date(i.created_at).toLocaleString("es-MX")}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn-small btn-edit" onClick={() => startEdit(i)}>
                                Editar
                              </button>
                              <button
                                className="btn-small btn-delete"
                                onClick={() => handleDeleteInscripcion(i.id, i.nombre_completo)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                    {filteredInscripciones.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>
                          {inscripciones.length === 0
                            ? "Aún no hay inscripciones."
                            : "Ningún resultado con ese filtro."}
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
