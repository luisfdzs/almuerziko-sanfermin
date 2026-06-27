# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Invitación web de una sola página para el **almuerziko de San Fermín** (6 de julio de 2026). Es un cartel-invitación, no una aplicación: todo el contenido es en español y el tono es festivo/informal (se mantiene a propósito).

Publicado vía GitHub Pages: https://luisfdzs.github.io/almuerziko-sanfermin

## Arquitectura

**Todo vive en `index.html`** — un único archivo con HTML, CSS (`<style>`) y JS (`<script>`) inline. Sin frameworks, sin build, sin dependencias externas, sin paso de compilación.

- **Para verlo**: abrir `index.html` directamente en el navegador. No hay servidor ni `npm`.
- **Para publicar**: copiar el archivo a cualquier hosting estático.

### Estructura del CSS
- Variables de tema en `:root` — la paleta (rojo `--rojo`, blanco `--blanco`, tinto, oro) y las familias tipográficas (`--shout` para titulares tipo cartel, `--sans`, `--serif`) se controlan ahí. Cambia los colores/fuentes en un solo sitio.
- `--maxw` define el ancho del póster; se amplía en el media query de escritorio (`min-width:760px`).
- Diseño *mobile-first*; el único breakpoint relevante es 760px.

### Secciones (en orden en el `<body>`)
`hero` (cuenta atrás) → `datos` → `programa` (timeline) → `dress` (código de vestimenta) → `mapa` → `rsvp` → `footer`. Las franjas `.faja` separan bloques.

### JavaScript (IIFE al final del body, tres bloques)
1. **Cuenta atrás** — `target` es la fecha del evento (`new Date(2026, 6, 6, 10, 0, 0)`; ojo: el mes es 0-indexado, `6` = julio). Actualiza los `#cd-*` cada segundo.
2. **Confeti** — partículas dibujadas en `<canvas id="confeti">`, lanzadas por `burst()`.
3. **RSVP** — el botón `#rsvp-btn` lanza el cohete + confeti y muestra `#rsvp-done`. No envía datos a ningún sitio: es puramente visual.

## Convenciones

- **Accesibilidad**: todas las animaciones (cuenta atrás aparte) se desactivan con `@media (prefers-reduced-motion: reduce)` y el JS comprueba `reduce` antes de animar. Respétalo al añadir movimiento.
- Si cambias la **fecha, hora, lugar o precio**, actualízalos en todos los puntos: el `target` del JS, el `.fecha-chip` y la cuenta atrás del hero, la sección `datos`, el `programa`, el enlace de Google Maps, el `<meta name="description">` y el `README.md`.
