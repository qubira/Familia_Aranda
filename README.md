# Evento Deportivo Familiar Aranda

Sitio web para el evento deportivo familiar: portada con info del evento y
equipos, formulario de inscripción (con foto de perfil), galería de fotos,
y panel de administración para ver/exportar inscripciones y gestionar logos
de equipo y la galería. Construido con Next.js, Neon (PostgreSQL) y
Cloudinary.

## Puesta en marcha local

1. Instala dependencias:

   ```
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa los valores (Neon,
   contraseña del admin, y credenciales de Cloudinary). **Cambia
   `ADMIN_PASSWORD` antes de compartir el link del panel.**

3. Crea las tablas y los 4 equipos de ejemplo en la base de datos:

   ```
   npm run seed
   ```

4. Levanta el servidor de desarrollo:

   ```
   npm run dev
   ```

   Abre http://localhost:3000

## Personalizar

- **Nombre del evento, fecha y sede**: edita el hero en
  [app/page.js](app/page.js).
- **Equipos/familias**: edita la tabla `equipos` en la base de datos (o
  cambia el `INSERT` en [db/schema.sql](db/schema.sql) antes de correr el
  seed). También puedes editarlos directamente en Neon, o subir su logo
  desde el panel admin.
- **Campos del formulario**: [app/inscripcion/page.js](app/inscripcion/page.js)
  (frontend) y [app/api/inscripciones/route.js](app/api/inscripciones/route.js)
  (validación/backend).
- **Colores y estilos**: [app/globals.css](app/globals.css).

## Fotos e imágenes (Cloudinary)

- Cada persona puede subir una foto de perfil opcional al inscribirse.
- Los organizadores pueden subir un logo por equipo desde el panel admin.
- Los organizadores pueden subir/borrar fotos en la galería pública
  (`/galeria`) desde el panel admin.

Todas las subidas pasan por rutas del servidor (`app/api/upload/perfil`,
`app/api/admin/equipos/logo`, `app/api/admin/galeria`) que usan el SDK de
Cloudinary con las credenciales del `.env.local`; el secreto nunca se
expone al navegador.

## Panel de administración

Entra a `/admin`, escribe la contraseña definida en `ADMIN_PASSWORD`. Ahí
puedes ver inscripciones (con foto) y estadísticas por equipo, exportar
todo a CSV, subir/cambiar el logo de cada equipo, y administrar la galería
de fotos del evento.

## Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Impórtalo en [vercel.com](https://vercel.com).
3. En "Environment Variables" agrega `DATABASE_URL`, `ADMIN_PASSWORD`,
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`
   (mismos valores de `.env.local`, o nuevos si quieres rotarlos).
4. Despliega. La primera vez, corre `npm run seed` una sola vez desde tu
   máquina local (usando el mismo `DATABASE_URL`) para crear las tablas y
   los equipos.
