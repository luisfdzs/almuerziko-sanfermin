# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Invitación web de una sola página para el **almuerziko de San Fermín** (6 de julio de 2026). Es un cartel-invitación, no una aplicación: todo el contenido es en español y el tono es festivo/informal (se mantiene a propósito).

Los invitados pueden **confirmar asistencia** dejando su nombre, que se guarda en MongoDB y se muestra como lista pública de asistentes.

## Arquitectura

Frontend estático + una función serverless. Se despliega en **Vercel** (la web y la API en el mismo proyecto).

- **`index.html`** — toda la web en un único archivo: HTML, CSS (`<style>`) y JS (`<script>`) inline. Sin frameworks ni build en el frontend.
- **`api/rsvp.js`** — función serverless de Vercel (Node, ESM). `GET` devuelve la lista de asistentes; `POST {name}` añade uno (upsert por nombre normalizado para evitar duplicados). Reutiliza la conexión a Mongo entre invocaciones vía `global._mongoClientPromise`.
- **`package.json`** — solo dependencia `mongodb`. El frontend no necesita `npm install`; las dependencias son para la función serverless.

### Variables de entorno (en Vercel)
- `MONGODB_URI` — **obligatoria**. Cadena de conexión de MongoDB Atlas. Nunca se commitea (está en `.gitignore` vía `.env`).
- `MONGODB_DB` — opcional, nombre de la base de datos (por defecto `sanfermin`). Colección: `asistentes`.

### Desarrollo y despliegue
- **Local con API**: `vercel dev` (ejecuta web + funciones; necesita `MONGODB_URI` en `.env`).
- **Solo ver la maqueta**: abrir `index.html` en el navegador — la cuenta atrás y el confeti funcionan, pero las llamadas a `/api/rsvp` fallan (sin servidor) y la lista queda vacía.
- **Desplegar**: push a `main` → Vercel construye y publica.

### Estructura del CSS
- Variables de tema en `:root` — la paleta (rojo `--rojo`, blanco `--blanco`, tinto, oro) y las familias tipográficas (`--shout` para titulares tipo cartel, `--sans`, `--serif`) se controlan ahí. Cambia los colores/fuentes en un solo sitio.
- `--maxw` define el ancho del póster; se amplía en el media query de escritorio (`min-width:760px`).
- Diseño *mobile-first*; el único breakpoint relevante es 760px.

### Secciones (en orden en el `<body>`)
`hero` (cuenta atrás) → `rsvp` (confirmar + lista de asistentes) → `datos` → `programa` (timeline) → `dress` (código de vestimenta) → `mapa` → `footer`. Las franjas `.faja` separan bloques.

### JavaScript (IIFE al final del body)
1. **Cuenta atrás** — `target` es la fecha del evento (`new Date(2026, 6, 6, 10, 0, 0)`; ojo: el mes es 0-indexado, `6` = julio). Actualiza los `#cd-*` cada segundo.
2. **Confeti** — partículas dibujadas en `<canvas id="confeti">`, lanzadas por `burst()`.
3. **RSVP + lista** — al pulsar `#rsvp-btn` aparece `#rsvp-form` para escribir el nombre; al enviar hace `POST /api/rsvp`, lanza cohete + confeti y re-renderiza la lista. `loadList()` hace `GET /api/rsvp` al cargar. Los nombres se escapan con `esc()` antes de meterlos en el DOM.

## Convenciones

- **Accesibilidad**: las animaciones se desactivan con `@media (prefers-reduced-motion: reduce)` y el JS comprueba `reduce` antes de animar. Respétalo al añadir movimiento.
- Si cambias la **fecha, hora, lugar o precio**, actualízalos en todos los puntos: el `target` del JS, el `.fecha-chip` y la cuenta atrás del hero, la sección `datos`, el `programa`, el enlace de Google Maps, el `<meta name="description">` y el `README.md`.
- **Nunca hardcodees la cadena de conexión** ni ningún secreto en el código: van en variables de entorno de Vercel.
