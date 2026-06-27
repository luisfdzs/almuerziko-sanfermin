# 🧣 Almuerziko San Fermín 2026

Invitación web para el **almuerziko de San Fermín** del **6 de julio de 2026**.
Una sola página, pensada *mobile-first* y con estética de cartel de fiestas (blanco y rojo),
con confirmación de asistencia guardada en MongoDB.

## ✨ Qué incluye

- **Cuenta atrás en vivo** hasta el chupinazo (6 de julio, 10:00).
- **Confirmar asistencia**: pones tu nombre y te unes a la **lista pública de asistentes** (guardada en MongoDB), con cohete + confeti al confirmar.
- **Datos del evento**: lugar (Calle Dormitalería, 74 · Pamplona), hora (10:00) y precio (25 €).
- **Programa del día** en formato *timeline* que sube de intensidad: de *almorzar tranquilos* al *¡desfase total!*.
- **Código de vestimenta** (blanco + pañuelico + faja) y aviso de fotógrafo profesional.
- **Cómo llegar** con enlace directo a Google Maps.

## 🛠️ Tecnología

- **Frontend**: HTML, CSS y JavaScript puros en un único archivo `index.html`. Sin frameworks ni build. El confeti está dibujado con Canvas y todas las animaciones respetan `prefers-reduced-motion`.
- **Backend**: función serverless `api/rsvp.js` (Node) con el driver oficial de **MongoDB**.
- **Hosting**: **Vercel** (web + API en el mismo proyecto).

## 🚀 Puesta en marcha

1. Crea las variables de entorno en Vercel:
   - `MONGODB_URI` — cadena de conexión de MongoDB Atlas (**obligatoria**).
   - `MONGODB_DB` — nombre de la base de datos (opcional, por defecto `sanfermin`).
2. Despliega en Vercel (importa el repo o `vercel --prod`).

### Desarrollo local

```bash
npm install
echo "MONGODB_URI=mongodb+srv://..." > .env
vercel dev
```

> Si solo abres `index.html` en el navegador verás la maqueta, pero la lista de asistentes
> estará vacía porque no hay servidor que responda a `/api/rsvp`.

---

Hecho con código y vino 🍷 — *Consulado Gallego en Pamplona*.
