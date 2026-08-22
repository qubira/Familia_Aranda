"use client";

import { useEffect, useState } from "react";

const initialForm = {
  nombreCompleto: "",
  email: "",
  telefono: "",
  categoria: "adulto",
  edad: "",
  equipoId: "",
};

export default function InscripcionPage() {
  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [foto, setFoto] = useState({ url: "", preview: "", uploading: false, error: "" });

  useEffect(() => {
    fetch("/api/equipos")
      .then((res) => res.json())
      .then((data) => {
        setEquipos(data.equipos || []);
        if (data.equipos?.length) {
          setForm((f) => ({ ...f, equipoId: String(data.equipos[0].id) }));
        }
      })
      .catch(() => setStatus({ state: "error", message: "No se pudieron cargar los equipos." }))
      .finally(() => setLoadingEquipos(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFoto({ url: "", preview: URL.createObjectURL(file), uploading: true, error: "" });

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload/perfil", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setFoto((f) => ({ ...f, uploading: false, error: data.error || "No se pudo subir la foto." }));
        return;
      }
      setFoto({ url: data.url, preview: data.url, uploading: false, error: "" });
    } catch {
      setFoto((f) => ({ ...f, uploading: false, error: "No se pudo conectar con el servidor." }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      const res = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          equipoId: Number(form.equipoId),
          edad: form.edad === "" ? null : Number(form.edad),
          fotoUrl: foto.url || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ state: "error", message: data.error || "Ocurrió un error." });
        return;
      }

      setStatus({
        state: "success",
        message: "¡Inscripción registrada con éxito! Nos vemos en el evento.",
      });
      setForm((f) => ({ ...initialForm, equipoId: f.equipoId }));
      setFoto({ url: "", preview: "", uploading: false, error: "" });
    } catch {
      setStatus({ state: "error", message: "No se pudo conectar con el servidor." });
    }
  }

  return (
    <main className="section">
      <div className="container">
        <h2>Formulario de inscripción</h2>
        <p className="lead">
          Indica tus datos y el equipo que representarás en el Evento Deportivo
          Familiar.
        </p>

        <div className="form-card">
          {status.state === "success" && (
            <div className="alert alert-success">{status.message}</div>
          )}
          {status.state === "error" && (
            <div className="alert alert-error">{status.message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="equipoId">Familia / equipo que representas</label>
              <select
                id="equipoId"
                name="equipoId"
                value={form.equipoId}
                onChange={handleChange}
                required
                disabled={loadingEquipos}
              >
                {loadingEquipos && <option>Cargando equipos...</option>}
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nombreCompleto">Nombre completo</label>
              <input
                id="nombreCompleto"
                name="nombreCompleto"
                type="text"
                value={form.nombreCompleto}
                onChange={handleChange}
                required
                maxLength={150}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria">Categoría</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="adulto">Adulto</option>
                  <option value="nino">Niño</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edad">Edad (opcional)</label>
                <input
                  id="edad"
                  name="edad"
                  type="number"
                  min="0"
                  max="120"
                  value={form.edad}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="foto">Foto de perfil (opcional)</label>
              <input id="foto" name="foto" type="file" accept="image/*" onChange={handleFotoChange} />
              {foto.uploading && <p className="hint">Subiendo foto...</p>}
              {foto.error && <p className="hint" style={{ color: "var(--error-text)" }}>{foto.error}</p>}
              {foto.preview && (
                <img
                  src={foto.preview}
                  alt="Vista previa"
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%", marginTop: 10 }}
                />
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={status.state === "loading" || loadingEquipos || foto.uploading}
            >
              {status.state === "loading" ? "Enviando..." : "Confirmar inscripción"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center" }}>
          <a href="/" className="link-back">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
