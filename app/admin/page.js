"use client";

import { useEffect, useMemo, useState } from "react";

const emptyEditForm = {
  nombreCompleto: "",
  categoria: "adulto",
  edad: "",
  equipoId: "",
  fotoUrl: "",
};

const emptyPartidoForm = { juegoId: "", equipoAId: "", equipoBId: "", horaInicio: "", horaFin: "" };

function toDatetimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toTimeValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  const [editFotoUploading, setEditFotoUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingEquipoId, setEditingEquipoId] = useState(null);
  const [equipoEditForm, setEquipoEditForm] = useState({ nombre: "", descripcion: "", color: "#1e3a8a" });
  const [equipoEditError, setEquipoEditError] = useState("");
  const [savingEquipoEdit, setSavingEquipoEdit] = useState(false);

  const [showNewEquipoForm, setShowNewEquipoForm] = useState(false);
  const [newEquipoForm, setNewEquipoForm] = useState({ nombre: "", descripcion: "", color: "#1e3a8a" });
  const [newEquipoError, setNewEquipoError] = useState("");
  const [creatingEquipo, setCreatingEquipo] = useState(false);
  const [deletingEquipoId, setDeletingEquipoId] = useState(null);

  const [juegos, setJuegos] = useState([]);
  const [showNewJuegoForm, setShowNewJuegoForm] = useState(false);
  const [newJuegoForm, setNewJuegoForm] = useState({ nombre: "", descripcion: "" });
  const [newJuegoError, setNewJuegoError] = useState("");
  const [creatingJuego, setCreatingJuego] = useState(false);
  const [editingJuegoId, setEditingJuegoId] = useState(null);
  const [juegoEditForm, setJuegoEditForm] = useState({ nombre: "", descripcion: "" });
  const [juegoEditError, setJuegoEditError] = useState("");
  const [savingJuegoEdit, setSavingJuegoEdit] = useState(false);
  const [juegoActionId, setJuegoActionId] = useState(null);
  const [juegoImagenUploading, setJuegoImagenUploading] = useState(null);

  const [partidos, setPartidos] = useState([]);
  const [showNewPartidoForm, setShowNewPartidoForm] = useState(false);
  const [newPartidoForm, setNewPartidoForm] = useState(emptyPartidoForm);
  const [newPartidoError, setNewPartidoError] = useState("");
  const [creatingPartido, setCreatingPartido] = useState(false);
  const [editingPartidoId, setEditingPartidoId] = useState(null);
  const [partidoEditForm, setPartidoEditForm] = useState(emptyPartidoForm);
  const [partidoEditError, setPartidoEditError] = useState("");
  const [savingPartidoEdit, setSavingPartidoEdit] = useState(false);
  const [deletingPartidoId, setDeletingPartidoId] = useState(null);

  const [configForm, setConfigForm] = useState({ eventoNombre: "", eventoFecha: "", eventoSede: "" });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configError, setConfigError] = useState("");
  const [configSuccess, setConfigSuccess] = useState(false);

  async function loadAll() {
    setLoading(true);
    const res = await fetch("/api/admin/inscripciones");
    if (res.status === 401) {
      setAuthState("out");
      setLoading(false);
      return;
    }
    const [inscripcionesData, equiposData, galeriaData, juegosData, partidosData, configData] = await Promise.all([
      res.json(),
      fetch("/api/equipos").then((r) => r.json()),
      fetch("/api/admin/galeria").then((r) => r.json()),
      fetch("/api/admin/juegos").then((r) => r.json()),
      fetch("/api/admin/partidos").then((r) => r.json()),
      fetch("/api/admin/config").then((r) => r.json()),
    ]);
    setInscripciones(inscripcionesData.inscripciones || []);
    setEquipos(equiposData.equipos || []);
    setGaleria(galeriaData.fotos || []);
    setJuegos(juegosData.juegos || []);
    setPartidos(partidosData.partidos || []);
    const cfg = configData.config || {};
    setConfigForm({
      eventoNombre: cfg.evento_nombre || "",
      eventoFecha: toDatetimeLocalValue(cfg.evento_fecha),
      eventoSede: cfg.evento_sede || "",
    });
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
    setJuegos([]);
    setPartidos([]);
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

  function startEquipoEdit(equipo) {
    setEditingEquipoId(equipo.id);
    setEquipoEditError("");
    setEquipoEditForm({
      nombre: equipo.nombre,
      descripcion: equipo.descripcion || "",
      color: equipo.color,
    });
  }

  function cancelEquipoEdit() {
    setEditingEquipoId(null);
    setEquipoEditError("");
  }

  async function saveEquipoEdit(id) {
    setSavingEquipoEdit(true);
    setEquipoEditError("");
    try {
      const res = await fetch(`/api/admin/equipos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipoEditForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setEquipoEditError(data.error || "No se pudo guardar.");
        setSavingEquipoEdit(false);
        return;
      }
      const equiposData = await fetch("/api/equipos").then((r) => r.json());
      setEquipos(equiposData.equipos || []);
      setEditingEquipoId(null);
    } catch {
      setEquipoEditError("No se pudo conectar con el servidor.");
    }
    setSavingEquipoEdit(false);
  }

  async function handleCreateEquipo(e) {
    e.preventDefault();
    setCreatingEquipo(true);
    setNewEquipoError("");
    try {
      const res = await fetch("/api/admin/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEquipoForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewEquipoError(data.error || "No se pudo crear el equipo.");
        setCreatingEquipo(false);
        return;
      }
      const equiposData = await fetch("/api/equipos").then((r) => r.json());
      setEquipos(equiposData.equipos || []);
      setNewEquipoForm({ nombre: "", descripcion: "", color: "#1e3a8a" });
      setShowNewEquipoForm(false);
    } catch {
      setNewEquipoError("No se pudo conectar con el servidor.");
    }
    setCreatingEquipo(false);
  }

  async function handleDeleteEquipo(id, nombre) {
    if (!window.confirm(`¿Eliminar el equipo "${nombre}"? Solo se puede si no tiene inscripciones.`)) {
      return;
    }
    setDeletingEquipoId(id);
    const res = await fetch(`/api/admin/equipos/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el equipo.");
    } else {
      setEquipos((list) => list.filter((e) => e.id !== id));
    }
    setDeletingEquipoId(null);
  }

  async function handleCreateJuego(e) {
    e.preventDefault();
    setCreatingJuego(true);
    setNewJuegoError("");
    try {
      const res = await fetch("/api/admin/juegos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJuegoForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewJuegoError(data.error || "No se pudo crear el juego.");
        setCreatingJuego(false);
        return;
      }
      const juegosData = await fetch("/api/admin/juegos").then((r) => r.json());
      setJuegos(juegosData.juegos || []);
      setNewJuegoForm({ nombre: "", descripcion: "" });
      setShowNewJuegoForm(false);
    } catch {
      setNewJuegoError("No se pudo conectar con el servidor.");
    }
    setCreatingJuego(false);
  }

  function startJuegoEdit(juego) {
    setEditingJuegoId(juego.id);
    setJuegoEditError("");
    setJuegoEditForm({ nombre: juego.nombre, descripcion: juego.descripcion || "" });
  }

  function cancelJuegoEdit() {
    setEditingJuegoId(null);
    setJuegoEditError("");
  }

  async function saveJuegoEdit(id, estado) {
    setSavingJuegoEdit(true);
    setJuegoEditError("");
    try {
      const res = await fetch(`/api/admin/juegos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...juegoEditForm, estado }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJuegoEditError(data.error || "No se pudo guardar.");
        setSavingJuegoEdit(false);
        return;
      }
      const juegosData = await fetch("/api/admin/juegos").then((r) => r.json());
      setJuegos(juegosData.juegos || []);
      setEditingJuegoId(null);
    } catch {
      setJuegoEditError("No se pudo conectar con el servidor.");
    }
    setSavingJuegoEdit(false);
  }

  async function toggleJuegoEstado(juego) {
    setJuegoActionId(juego.id);
    const nuevoEstado = juego.estado === "propuesto" ? "confirmado" : "propuesto";
    const res = await fetch(`/api/admin/juegos/${juego.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: juego.nombre, descripcion: juego.descripcion, estado: nuevoEstado }),
    });
    if (res.ok) {
      setJuegos((list) => list.map((j) => (j.id === juego.id ? { ...j, estado: nuevoEstado } : j)));
    }
    setJuegoActionId(null);
  }

  async function handleDeleteJuego(id, nombre) {
    if (!window.confirm(`¿Eliminar el juego "${nombre}"?`)) return;
    setJuegoActionId(id);
    const res = await fetch(`/api/admin/juegos/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el juego.");
    } else {
      setJuegos((list) => list.filter((j) => j.id !== id));
    }
    setJuegoActionId(null);
  }

  async function handleJuegoImagenChange(juegoId, file) {
    if (!file) return;
    setJuegoImagenUploading(juegoId);
    const body = new FormData();
    body.append("file", file);
    body.append("juegoId", juegoId);
    const res = await fetch("/api/admin/juegos/imagen", { method: "POST", body });
    if (res.ok) {
      const { url } = await res.json();
      setJuegos((list) => list.map((j) => (j.id === juegoId ? { ...j, imagen_url: url } : j)));
    }
    setJuegoImagenUploading(null);
  }

  async function handleCreatePartido(e) {
    e.preventDefault();
    setCreatingPartido(true);
    setNewPartidoError("");
    const eventoFecha = configForm.eventoFecha ? configForm.eventoFecha.split("T")[0] : null;
    if (!eventoFecha) {
      setNewPartidoError("Primero configura la fecha del evento en la pestaña Configuración.");
      setCreatingPartido(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/partidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPartidoForm,
          horaInicio: `${eventoFecha}T${newPartidoForm.horaInicio}`,
          horaFin: `${eventoFecha}T${newPartidoForm.horaFin}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewPartidoError(data.error || "No se pudo crear el partido.");
        setCreatingPartido(false);
        return;
      }
      const partidosData = await fetch("/api/admin/partidos").then((r) => r.json());
      setPartidos(partidosData.partidos || []);
      setNewPartidoForm(emptyPartidoForm);
      setShowNewPartidoForm(false);
    } catch {
      setNewPartidoError("No se pudo conectar con el servidor.");
    }
    setCreatingPartido(false);
  }

  function startPartidoEdit(p) {
    setEditingPartidoId(p.id);
    setPartidoEditError("");
    setPartidoEditForm({
      juegoId: String(p.juego_id),
      equipoAId: String(p.equipo_a_id),
      equipoBId: String(p.equipo_b_id),
      horaInicio: toTimeValue(p.hora_inicio),
      horaFin: toTimeValue(p.hora_fin),
    });
  }

  function cancelPartidoEdit() {
    setEditingPartidoId(null);
    setPartidoEditError("");
  }

  async function savePartidoEdit(id) {
    setSavingPartidoEdit(true);
    setPartidoEditError("");
    const eventoFecha = configForm.eventoFecha ? configForm.eventoFecha.split("T")[0] : null;
    if (!eventoFecha) {
      setPartidoEditError("Primero configura la fecha del evento en la pestaña Configuración.");
      setSavingPartidoEdit(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/partidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...partidoEditForm,
          horaInicio: `${eventoFecha}T${partidoEditForm.horaInicio}`,
          horaFin: `${eventoFecha}T${partidoEditForm.horaFin}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPartidoEditError(data.error || "No se pudo guardar.");
        setSavingPartidoEdit(false);
        return;
      }
      const partidosData = await fetch("/api/admin/partidos").then((r) => r.json());
      setPartidos(partidosData.partidos || []);
      setEditingPartidoId(null);
    } catch {
      setPartidoEditError("No se pudo conectar con el servidor.");
    }
    setSavingPartidoEdit(false);
  }

  async function handleDeletePartido(id) {
    if (!window.confirm("¿Eliminar este partido de la planificación?")) return;
    setDeletingPartidoId(id);
    setPartidos((list) => list.filter((p) => p.id !== id));
    await fetch(`/api/admin/partidos/${id}`, { method: "DELETE" });
    setDeletingPartidoId(null);
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    setSavingConfig(true);
    setConfigError("");
    setConfigSuccess(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfigError(data.error || "No se pudo guardar.");
        setSavingConfig(false);
        return;
      }
      setConfigSuccess(true);
    } catch {
      setConfigError("No se pudo conectar con el servidor.");
    }
    setSavingConfig(false);
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
      categoria: i.categoria,
      edad: i.edad ?? "",
      equipoId: String(equipos.find((e) => e.nombre === i.equipo)?.id || ""),
      fotoUrl: i.foto_url || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyEditForm);
    setEditError("");
  }

  async function handleEditFotoChange(file) {
    if (!file) return;
    setEditFotoUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload/perfil", { method: "POST", body });
      const data = await res.json();
      if (res.ok) {
        setEditForm((f) => ({ ...f, fotoUrl: data.url }));
      } else {
        setEditError(data.error || "No se pudo subir la foto.");
      }
    } catch {
      setEditError("No se pudo conectar con el servidor.");
    }
    setEditFotoUploading(false);
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
      const matchesTerm = !term || i.nombre_completo.toLowerCase().includes(term);
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

  const conFoto = inscripciones.filter((i) => i.foto_url).length;

  const rangosEdad = [
    { label: "0-5", min: 0, max: 5 },
    { label: "6-12", min: 6, max: 12 },
    { label: "13-17", min: 13, max: 17 },
    { label: "18-30", min: 18, max: 30 },
    { label: "31-50", min: 31, max: 50 },
    { label: "51+", min: 51, max: 999 },
  ].map((r) => ({
    ...r,
    count: inscripciones.filter((i) => i.edad !== null && i.edad >= r.min && i.edad <= r.max).length,
  }));
  const maxRangoEdad = Math.max(1, ...rangosEdad.map((r) => r.count));
  const sinEdad = inscripciones.filter((i) => i.edad === null).length;

  const totalInscritosDashboard = inscripciones.length;
  let acumulado = 0;
  const donutStops = porEquipo
    .filter((e) => e.count > 0)
    .map((e) => {
      const start = (acumulado / (totalInscritosDashboard || 1)) * 100;
      acumulado += e.count;
      const end = (acumulado / (totalInscritosDashboard || 1)) * 100;
      return `${e.color} ${start}% ${end}%`;
    });
  const donutBackground =
    totalInscritosDashboard > 0 ? `conic-gradient(${donutStops.join(", ")})` : null;

  const juegosPropuestos = juegos.filter((j) => j.estado === "propuesto");
  const juegosConfirmados = juegos.filter((j) => j.estado === "confirmado");

  function renderJuegoCard(juego) {
    if (editingJuegoId === juego.id) {
      return (
        <div className="equipo-manage-card equipo-editing" key={juego.id}>
          <div className="equipo-edit-fields">
            <input
              placeholder="Nombre del juego"
              value={juegoEditForm.nombre}
              onChange={(e) => setJuegoEditForm((f) => ({ ...f, nombre: e.target.value }))}
              maxLength={150}
            />
            <input
              placeholder="Descripción (opcional)"
              value={juegoEditForm.descripcion}
              onChange={(e) => setJuegoEditForm((f) => ({ ...f, descripcion: e.target.value }))}
              maxLength={500}
            />
          </div>
          <div className="row-actions">
            <button
              className="btn-small btn-save"
              onClick={() => saveJuegoEdit(juego.id, juego.estado)}
              disabled={savingJuegoEdit}
            >
              {savingJuegoEdit ? "..." : "Guardar"}
            </button>
            <button className="btn-small btn-cancel" onClick={cancelJuegoEdit} disabled={savingJuegoEdit}>
              Cancelar
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="juego-card" key={juego.id}>
        <div className="juego-card-top">
          {juego.imagen_url ? (
            <img src={juego.imagen_url} alt={juego.nombre} className="juego-imagen" />
          ) : (
            <div className="juego-imagen juego-imagen-placeholder">🎮</div>
          )}
          <div className="juego-info">
            <strong>{juego.nombre}</strong>
            {juego.descripcion && <p>{juego.descripcion}</p>}
            <input
              type="file"
              accept="image/*"
              disabled={juegoImagenUploading === juego.id}
              onChange={(e) => handleJuegoImagenChange(juego.id, e.target.files?.[0])}
              style={{ fontSize: "0.75rem" }}
            />
            {juegoImagenUploading === juego.id && <span className="hint">Subiendo...</span>}
          </div>
        </div>
        <div className="row-actions">
          <button
            className="btn-small btn-save"
            onClick={() => toggleJuegoEstado(juego)}
            disabled={juegoActionId === juego.id}
          >
            {juego.estado === "propuesto" ? "Confirmar" : "Volver a propuesto"}
          </button>
          <button className="btn-small btn-edit" onClick={() => startJuegoEdit(juego)}>
            Editar
          </button>
          <button
            className="btn-small btn-delete"
            disabled={juegoActionId === juego.id}
            onClick={() => handleDeleteJuego(juego.id, juego.nombre)}
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "inscripciones", label: "Inscripciones", icon: "📝", badge: inscripciones.length },
    { key: "equipos", label: "Equipos", icon: "🎽" },
    { key: "juegos", label: "Juegos", icon: "🎮", badge: juegos.length },
    { key: "planificacion", label: "Planificación", icon: "📅", badge: partidos.length },
    { key: "configuracion", label: "Configuración", icon: "⚙️" },
    { key: "galeria", label: "Galería", icon: "📸", badge: galeria.length },
  ];

  const tabTitles = {
    dashboard: "📊 Dashboard",
    inscripciones: `📝 Inscripciones (${filteredInscripciones.length} de ${inscripciones.length})`,
    equipos: "🎽 Logos de equipos",
    juegos: "🎮 Juegos",
    planificacion: "📅 Planificación",
    configuracion: "⚙️ Configuración",
    galeria: `📸 Galería del evento (${galeria.length})`,
  };

  return (
    <div className={`admin-layout${sidebarOpen ? " sidebar-open" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-brand">🏆 Panel Aranda</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item${activeTab === item.key ? " active" : ""}`}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {typeof item.badge === "number" && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" className="admin-nav-item">
            <span className="admin-nav-icon">←</span>
            <span>Volver al inicio</span>
          </a>
          <button className="admin-nav-item" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)}>
        ☰ Menú
      </button>

      <main className="admin-main">
        <div className="admin-header">
          <h2 style={{ margin: 0 }}>{tabTitles[activeTab]}</h2>
          {activeTab === "inscripciones" && (
            <a href="/api/admin/export" className="btn btn-primary">
              Exportar CSV
            </a>
          )}
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <>
              <div className="admin-stats">
                <div className="stat-card">
                  <div className="num">{totalInscritosDashboard}</div>
                  <div className="label">Total inscritos</div>
                </div>
                <div className="stat-card">
                  <div className="num">{equipos.length}</div>
                  <div className="label">Equipos</div>
                </div>
                <div className="stat-card">
                  <div className="num">{ninos}</div>
                  <div className="label">Niños</div>
                </div>
                <div className="stat-card">
                  <div className="num">{adultos}</div>
                  <div className="label">Adultos</div>
                </div>
                <div className="stat-card">
                  <div className="num">{conFoto}</div>
                  <div className="label">Con foto de perfil</div>
                </div>
              </div>

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
                  <h4>Distribución por equipo</h4>
                  {!donutBackground ? (
                    <p className="empty-chart">Sin datos todavía.</p>
                  ) : (
                    <div className="donut-wrap">
                      <div className="donut-chart" style={{ background: donutBackground }}>
                        <div className="donut-hole">{totalInscritosDashboard}</div>
                      </div>
                      <ul className="donut-legend">
                        {porEquipo
                          .filter((e) => e.count > 0)
                          .map((e) => (
                            <li key={e.id}>
                              <span className="legend-dot" style={{ background: e.color }} />
                              {e.nombre} · {Math.round((e.count / totalInscritosDashboard) * 100)}%
                            </li>
                          ))}
                      </ul>
                    </div>
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

                <div className="chart-card">
                  <h4>Rango de edades</h4>
                  {totalInscritosDashboard - sinEdad === 0 ? (
                    <p className="empty-chart">Sin datos todavía.</p>
                  ) : (
                    <>
                      {rangosEdad.map((r) => (
                        <div className="chart-bar-row" key={r.label}>
                          <span className="chart-bar-label">{r.label} años</span>
                          <div className="chart-bar-track">
                            <div
                              className="chart-bar-fill"
                              style={{ width: `${(r.count / maxRangoEdad) * 100}%`, "--bar-color": "var(--accent)" }}
                            />
                          </div>
                          <span className="chart-bar-value">{r.count}</span>
                        </div>
                      ))}
                      {sinEdad > 0 && <p className="hint">{sinEdad} sin edad registrada.</p>}
                    </>
                  )}
                </div>
              </div>
              </>
            )}

            {activeTab === "inscripciones" && (
              <>
              <div className="filter-bar">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
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
                          <td className="edit-cell">
                            {editForm.fotoUrl && <img src={editForm.fotoUrl} alt="" className="thumb" />}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={editFotoUploading}
                              onChange={(e) => handleEditFotoChange(e.target.files?.[0])}
                              style={{ fontSize: "0.7rem", width: 90 }}
                            />
                            {editFotoUploading && <span className="hint">Subiendo...</span>}
                            {editForm.fotoUrl && !editFotoUploading && (
                              <button
                                type="button"
                                className="btn-small btn-cancel"
                                onClick={() => setEditForm((f) => ({ ...f, fotoUrl: "" }))}
                              >
                                Quitar
                              </button>
                            )}
                          </td>
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
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, nombreCompleto: e.target.value.toUpperCase() }))
                              }
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
                        <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>
                          {inscripciones.length === 0
                            ? "Aún no hay inscripciones."
                            : "Ningún resultado con ese filtro."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </>
            )}

            {activeTab === "equipos" && (
              <>
              {!showNewEquipoForm ? (
                <button
                  className="btn btn-primary"
                  style={{ marginBottom: 20 }}
                  onClick={() => setShowNewEquipoForm(true)}
                >
                  + Nuevo equipo
                </button>
              ) : (
                <form onSubmit={handleCreateEquipo} className="equipo-manage-card equipo-editing" style={{ marginBottom: 20 }}>
                  {newEquipoError && <div className="alert alert-error" style={{ width: "100%" }}>{newEquipoError}</div>}
                  <input
                    type="color"
                    className="color-input"
                    value={newEquipoForm.color}
                    onChange={(e) => setNewEquipoForm((f) => ({ ...f, color: e.target.value }))}
                  />
                  <div className="equipo-edit-fields">
                    <input
                      placeholder="Nombre del equipo"
                      value={newEquipoForm.nombre}
                      onChange={(e) => setNewEquipoForm((f) => ({ ...f, nombre: e.target.value }))}
                      maxLength={100}
                      required
                      autoFocus
                    />
                    <input
                      placeholder="Descripción (opcional)"
                      value={newEquipoForm.descripcion}
                      onChange={(e) => setNewEquipoForm((f) => ({ ...f, descripcion: e.target.value }))}
                      maxLength={300}
                    />
                  </div>
                  <div className="row-actions">
                    <button type="submit" className="btn-small btn-save" disabled={creatingEquipo}>
                      {creatingEquipo ? "..." : "Crear"}
                    </button>
                    <button
                      type="button"
                      className="btn-small btn-cancel"
                      disabled={creatingEquipo}
                      onClick={() => {
                        setShowNewEquipoForm(false);
                        setNewEquipoError("");
                        setNewEquipoForm({ nombre: "", descripcion: "", color: "#1e3a8a" });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {equipoEditError && <div className="alert alert-error">{equipoEditError}</div>}
              {equipos.map((equipo) =>
                editingEquipoId === equipo.id ? (
                  <div className="equipo-manage-card equipo-editing" key={equipo.id}>
                    <input
                      type="color"
                      className="color-input"
                      value={equipoEditForm.color}
                      onChange={(e) => setEquipoEditForm((f) => ({ ...f, color: e.target.value }))}
                    />
                    <div className="equipo-edit-fields">
                      <input
                        placeholder="Nombre del equipo"
                        value={equipoEditForm.nombre}
                        onChange={(e) => setEquipoEditForm((f) => ({ ...f, nombre: e.target.value }))}
                        maxLength={100}
                      />
                      <input
                        placeholder="Descripción (opcional)"
                        value={equipoEditForm.descripcion}
                        onChange={(e) => setEquipoEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                        maxLength={300}
                      />
                    </div>
                    <div className="row-actions">
                      <button
                        className="btn-small btn-save"
                        onClick={() => saveEquipoEdit(equipo.id)}
                        disabled={savingEquipoEdit}
                      >
                        {savingEquipoEdit ? "..." : "Guardar"}
                      </button>
                      <button className="btn-small btn-cancel" onClick={cancelEquipoEdit} disabled={savingEquipoEdit}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="equipo-manage-card" key={equipo.id}>
                    {equipo.logo_url ? (
                      <img src={equipo.logo_url} alt={equipo.nombre} style={{ borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div className="team-dot" style={{ "--team-color": equipo.color }} />
                    )}
                    <div className="equipo-nombre">
                      {equipo.nombre}
                      {equipo.descripcion && <span className="equipo-descripcion">{equipo.descripcion}</span>}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={logoUploading === equipo.id}
                      onChange={(e) => handleLogoChange(equipo.id, e.target.files?.[0])}
                    />
                    {logoUploading === equipo.id && <span className="hint">Subiendo...</span>}
                    <div className="row-actions">
                      <button className="btn-small btn-edit" onClick={() => startEquipoEdit(equipo)}>
                        Editar
                      </button>
                      <button
                        className="btn-small btn-delete"
                        disabled={deletingEquipoId === equipo.id}
                        onClick={() => handleDeleteEquipo(equipo.id, equipo.nombre)}
                      >
                        {deletingEquipoId === equipo.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                )
              )}
              </>
            )}

            {activeTab === "juegos" && (
              <>
              {!showNewJuegoForm ? (
                <button
                  className="btn btn-primary"
                  style={{ marginBottom: 20 }}
                  onClick={() => setShowNewJuegoForm(true)}
                >
                  + Nuevo juego
                </button>
              ) : (
                <form onSubmit={handleCreateJuego} className="equipo-manage-card equipo-editing" style={{ marginBottom: 20 }}>
                  {newJuegoError && <div className="alert alert-error" style={{ width: "100%" }}>{newJuegoError}</div>}
                  <div className="equipo-edit-fields">
                    <input
                      placeholder="Nombre del juego"
                      value={newJuegoForm.nombre}
                      onChange={(e) => setNewJuegoForm((f) => ({ ...f, nombre: e.target.value }))}
                      maxLength={150}
                      required
                      autoFocus
                    />
                    <input
                      placeholder="Descripción (opcional)"
                      value={newJuegoForm.descripcion}
                      onChange={(e) => setNewJuegoForm((f) => ({ ...f, descripcion: e.target.value }))}
                      maxLength={500}
                    />
                  </div>
                  <div className="row-actions">
                    <button type="submit" className="btn-small btn-save" disabled={creatingJuego}>
                      {creatingJuego ? "..." : "Crear"}
                    </button>
                    <button
                      type="button"
                      className="btn-small btn-cancel"
                      disabled={creatingJuego}
                      onClick={() => {
                        setShowNewJuegoForm(false);
                        setNewJuegoError("");
                        setNewJuegoForm({ nombre: "", descripcion: "" });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {juegoEditError && <div className="alert alert-error">{juegoEditError}</div>}

              <div className="juegos-columns">
                <div className="juegos-column">
                  <h3>🎯 Propuestos</h3>
                  {juegosPropuestos.length === 0 && <p className="empty-chart">Sin juegos propuestos.</p>}
                  {juegosPropuestos.map(renderJuegoCard)}
                </div>
                <div className="juegos-column">
                  <h3>✅ Confirmados</h3>
                  {juegosConfirmados.length === 0 && <p className="empty-chart">Sin juegos confirmados.</p>}
                  {juegosConfirmados.map(renderJuegoCard)}
                </div>
              </div>
              </>
            )}

            {activeTab === "planificacion" && (
              <>
              {!configForm.eventoFecha ? (
                <p className="empty-chart">
                  Primero configura la fecha del evento en la pestaña "Configuración". Todos los partidos se
                  programan a una hora de ese mismo día.
                </p>
              ) : juegosConfirmados.length === 0 ? (
                <p className="empty-chart">
                  Primero confirma al menos un juego en la pestaña "Juegos" para poder planificar partidos.
                </p>
              ) : (
                <>
                <p className="hint" style={{ marginBottom: 16 }}>
                  📅 Todos los partidos serán el{" "}
                  {new Date(`${configForm.eventoFecha.split("T")[0]}T00:00`).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  .
                </p>
                {!showNewPartidoForm ? (
                  <button
                    className="btn btn-primary"
                    style={{ marginBottom: 20 }}
                    onClick={() => setShowNewPartidoForm(true)}
                  >
                    + Nuevo partido
                  </button>
                ) : (
                  <form onSubmit={handleCreatePartido} className="partido-form">
                    {newPartidoError && <div className="alert alert-error">{newPartidoError}</div>}
                    <div className="form-group">
                      <label>Juego</label>
                      <select
                        value={newPartidoForm.juegoId}
                        onChange={(e) => setNewPartidoForm((f) => ({ ...f, juegoId: e.target.value }))}
                        required
                      >
                        <option value="">Selecciona un juego</option>
                        {juegosConfirmados.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Equipo A</label>
                        <select
                          value={newPartidoForm.equipoAId}
                          onChange={(e) => setNewPartidoForm((f) => ({ ...f, equipoAId: e.target.value }))}
                          required
                        >
                          <option value="">Selecciona equipo</option>
                          {equipos.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              {eq.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Equipo B</label>
                        <select
                          value={newPartidoForm.equipoBId}
                          onChange={(e) => setNewPartidoForm((f) => ({ ...f, equipoBId: e.target.value }))}
                          required
                        >
                          <option value="">Selecciona equipo</option>
                          {equipos.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              {eq.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Hora de inicio</label>
                        <input
                          type="time"
                          value={newPartidoForm.horaInicio}
                          onChange={(e) => setNewPartidoForm((f) => ({ ...f, horaInicio: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hora de fin</label>
                        <input
                          type="time"
                          value={newPartidoForm.horaFin}
                          onChange={(e) => setNewPartidoForm((f) => ({ ...f, horaFin: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="row-actions">
                      <button type="submit" className="btn-small btn-save" disabled={creatingPartido}>
                        {creatingPartido ? "..." : "Crear partido"}
                      </button>
                      <button
                        type="button"
                        className="btn-small btn-cancel"
                        disabled={creatingPartido}
                        onClick={() => {
                          setShowNewPartidoForm(false);
                          setNewPartidoError("");
                          setNewPartidoForm(emptyPartidoForm);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
                </>
              )}

              {partidoEditError && <div className="alert alert-error">{partidoEditError}</div>}

              <div className="partidos-list">
                {partidos.length === 0 && <p className="empty-chart">Aún no hay partidos programados.</p>}
                {partidos.map((p) =>
                  editingPartidoId === p.id ? (
                    <form
                      key={p.id}
                      className="partido-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        savePartidoEdit(p.id);
                      }}
                    >
                      <div className="form-group">
                        <label>Juego</label>
                        <select
                          value={partidoEditForm.juegoId}
                          onChange={(e) => setPartidoEditForm((f) => ({ ...f, juegoId: e.target.value }))}
                          required
                        >
                          {juegos.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Equipo A</label>
                          <select
                            value={partidoEditForm.equipoAId}
                            onChange={(e) => setPartidoEditForm((f) => ({ ...f, equipoAId: e.target.value }))}
                            required
                          >
                            {equipos.map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Equipo B</label>
                          <select
                            value={partidoEditForm.equipoBId}
                            onChange={(e) => setPartidoEditForm((f) => ({ ...f, equipoBId: e.target.value }))}
                            required
                          >
                            {equipos.map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Hora de inicio</label>
                          <input
                            type="time"
                            value={partidoEditForm.horaInicio}
                            onChange={(e) => setPartidoEditForm((f) => ({ ...f, horaInicio: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Hora de fin</label>
                          <input
                            type="time"
                            value={partidoEditForm.horaFin}
                            onChange={(e) => setPartidoEditForm((f) => ({ ...f, horaFin: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="row-actions">
                        <button type="submit" className="btn-small btn-save" disabled={savingPartidoEdit}>
                          {savingPartidoEdit ? "..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          className="btn-small btn-cancel"
                          onClick={cancelPartidoEdit}
                          disabled={savingPartidoEdit}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="partido-card" key={p.id}>
                      <div className="partido-juego">{p.juego_nombre}</div>
                      <div className="partido-vs">
                        <span className="partido-equipo" style={{ "--team-color": p.equipo_a_color }}>
                          {p.equipo_a_nombre}
                        </span>
                        <span className="partido-vs-label">VS</span>
                        <span className="partido-equipo" style={{ "--team-color": p.equipo_b_color }}>
                          {p.equipo_b_nombre}
                        </span>
                      </div>
                      <div className="partido-hora">
                        {new Date(p.hora_inicio).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" – "}
                        {new Date(p.hora_fin).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="row-actions">
                        <button className="btn-small btn-edit" onClick={() => startPartidoEdit(p)}>
                          Editar
                        </button>
                        <button
                          className="btn-small btn-delete"
                          disabled={deletingPartidoId === p.id}
                          onClick={() => handleDeletePartido(p.id)}
                        >
                          {deletingPartidoId === p.id ? "..." : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
              </>
            )}

            {activeTab === "configuracion" && (
              <form onSubmit={handleSaveConfig} className="form-card" style={{ margin: 0, maxWidth: 480 }}>
                {configError && <div className="alert alert-error">{configError}</div>}
                {configSuccess && <div className="alert alert-success">Configuración guardada.</div>}
                <div className="form-group">
                  <label htmlFor="eventoNombre">Nombre del evento</label>
                  <input
                    id="eventoNombre"
                    value={configForm.eventoNombre}
                    onChange={(e) => setConfigForm((f) => ({ ...f, eventoNombre: e.target.value }))}
                    maxLength={200}
                    placeholder="Evento Deportivo Familiar Aranda 2026"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventoFecha">Fecha y hora del evento</label>
                  <input
                    id="eventoFecha"
                    type="datetime-local"
                    value={configForm.eventoFecha}
                    onChange={(e) => setConfigForm((f) => ({ ...f, eventoFecha: e.target.value }))}
                  />
                  <p className="hint">Se mostrará como cuenta regresiva en la portada.</p>
                </div>
                <div className="form-group">
                  <label htmlFor="eventoSede">Sede / lugar</label>
                  <input
                    id="eventoSede"
                    value={configForm.eventoSede}
                    onChange={(e) => setConfigForm((f) => ({ ...f, eventoSede: e.target.value }))}
                    maxLength={200}
                    placeholder="Parque Central, Ciudad"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={savingConfig}>
                  {savingConfig ? "Guardando..." : "Guardar configuración"}
                </button>
              </form>
            )}

            {activeTab === "galeria" && (
              <>
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
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
