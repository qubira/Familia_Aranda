-- Esquema para el evento deportivo familiar

CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(20) NOT NULL DEFAULT '#2563eb',
  descripcion TEXT,
  logo_url TEXT,
  logo_public_id TEXT
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id SERIAL PRIMARY KEY,
  equipo_id INTEGER NOT NULL REFERENCES equipos(id),
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  telefono VARCHAR(30),
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('nino', 'adulto')),
  edad INTEGER,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fotos_evento (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  descripcion VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS juegos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'propuesto' CHECK (estado IN ('propuesto', 'confirmado')),
  imagen_url TEXT,
  imagen_public_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partidos (
  id SERIAL PRIMARY KEY,
  juego_id INTEGER NOT NULL REFERENCES juegos(id),
  equipo_a_id INTEGER NOT NULL REFERENCES equipos(id),
  equipo_b_id INTEGER NOT NULL REFERENCES equipos(id),
  hora_inicio TIMESTAMPTZ NOT NULL,
  hora_fin TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (equipo_a_id <> equipo_b_id),
  CHECK (hora_fin > hora_inicio)
);

CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY DEFAULT 1,
  evento_nombre VARCHAR(200),
  evento_fecha TIMESTAMPTZ,
  evento_sede VARCHAR(200),
  CHECK (id = 1)
);

INSERT INTO configuracion (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE equipos ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS logo_public_id TEXT;
ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE inscripciones ALTER COLUMN email DROP NOT NULL;
ALTER TABLE inscripciones ALTER COLUMN telefono DROP NOT NULL;
ALTER TABLE juegos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE juegos ADD COLUMN IF NOT EXISTS imagen_public_id TEXT;

CREATE INDEX IF NOT EXISTS idx_inscripciones_equipo ON inscripciones(equipo_id);

-- Solo siembra los equipos de ejemplo si la tabla esta completamente vacia,
-- para no volver a insertarlos si ya fueron renombrados por un organizador.
INSERT INTO equipos (nombre, color, descripcion)
SELECT * FROM (VALUES
  ('Equipo Aranda Rojo', '#dc2626', 'La rama roja de la familia'),
  ('Equipo Aranda Azul', '#2563eb', 'La rama azul de la familia'),
  ('Equipo Aranda Verde', '#16a34a', 'La rama verde de la familia'),
  ('Equipo Aranda Amarillo', '#ca8a04', 'La rama amarilla de la familia')
) AS v(nombre, color, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM equipos);
