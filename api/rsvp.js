import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "Almuerziko";
const COLLECTION = "asistentes";
const CLAVE = process.env.RSVP_CLAVE;

// Estado de pago de cada asistente (se guarda en la BD):
//   pendiente → aún no ha pagado los 20 € (chip blanco)
//   pagado    → ya ha pagado (chip rojo)
//   aporta    → trae su propia comida/bebida, no paga (chip oro)
const ESTADOS = ["pendiente", "pagado", "aporta"];
const ESTADO_DEFECTO = "pendiente";

// Comprueba la clave de la cuadrilla (solo para apuntarse/desapuntarse).
// Devuelve true si todo OK; si no, escribe la respuesta de error y devuelve false.
function claveOk(res, body) {
  if (!CLAVE) {
    res.status(503).json({ error: "El registro no está configurado todavía" });
    return false;
  }
  const dada = body && body.clave ? String(body.clave).trim() : "";
  if (dada !== CLAVE) {
    res.status(401).json({ error: "Clave de la cuadrilla incorrecta" });
    return false;
  }
  return true;
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body || {};
}

// Reutilizamos la conexión entre invocaciones (clave en serverless):
// cada función "fría" abre una conexión, las "calientes" la reaprovechan.
let clientPromise = global._mongoClientPromise;

async function getCollection() {
  if (!uri) throw new Error("Falta la variable de entorno MONGODB_URI");
  if (!clientPromise) {
    clientPromise = global._mongoClientPromise = new MongoClient(uri).connect();
  }
  const client = await clientPromise;
  return client.db(DB_NAME).collection(COLLECTION);
}

async function listaAsistentes(col) {
  return col
    .find({}, { projection: { _id: 0, name: 1, estado: 1, createdAt: 1 } })
    .sort({ createdAt: 1 })
    .toArray();
}

export default async function handler(req, res) {
  try {
    const col = await getCollection();

    if (req.method === "GET") {
      const asistentes = await listaAsistentes(col);
      return res.status(200).json({ asistentes });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      if (!claveOk(res, body)) return;

      let name = (body.name ? String(body.name) : "")
        .trim()
        .replace(/\s+/g, " ");

      if (!name) return res.status(400).json({ error: "Falta el nombre" });
      if (name.length > 40) name = name.slice(0, 40);

      // upsert por nombre normalizado: evita duplicados si alguien confirma dos veces.
      const nameLower = name.toLowerCase();
      await col.updateOne(
        { nameLower },
        { $setOnInsert: { name, nameLower, estado: ESTADO_DEFECTO, createdAt: new Date() } },
        { upsert: true }
      );

      const asistentes = await listaAsistentes(col);
      return res.status(200).json({ asistentes });
    }

    if (req.method === "DELETE") {
      const body = parseBody(req);
      if (!claveOk(res, body)) return;

      const name = (body.name ? String(body.name) : "")
        .trim()
        .replace(/\s+/g, " ");

      if (!name) return res.status(400).json({ error: "Falta el nombre" });

      await col.deleteOne({ nameLower: name.toLowerCase() });

      const asistentes = await listaAsistentes(col);
      return res.status(200).json({ asistentes });
    }

    if (req.method === "PATCH") {
      const body = parseBody(req);
      if (!claveOk(res, body)) return;

      const name = (body.name ? String(body.name) : "")
        .trim()
        .replace(/\s+/g, " ");
      if (!name) return res.status(400).json({ error: "Falta el nombre" });

      const estado = body.estado ? String(body.estado).trim().toLowerCase() : "";
      if (!ESTADOS.includes(estado)) {
        return res.status(400).json({ error: "Estado no válido (pendiente, pagado o aporta)" });
      }

      const r = await col.updateOne(
        { nameLower: name.toLowerCase() },
        { $set: { estado } }
      );
      if (r.matchedCount === 0) {
        return res.status(404).json({ error: "No existe ese asistente" });
      }

      const asistentes = await listaAsistentes(col);
      return res.status(200).json({ asistentes });
    }

    res.setHeader("Allow", "GET, POST, DELETE, PATCH");
    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("Error en /api/rsvp:", err);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
