import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "Almuerziko";
const COLLECTION = "asistentes";

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
    .find({}, { projection: { _id: 0, name: 1, createdAt: 1 } })
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
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      let name = (body && body.name ? String(body.name) : "")
        .trim()
        .replace(/\s+/g, " ");

      if (!name) return res.status(400).json({ error: "Falta el nombre" });
      if (name.length > 40) name = name.slice(0, 40);

      // upsert por nombre normalizado: evita duplicados si alguien confirma dos veces.
      const nameLower = name.toLowerCase();
      await col.updateOne(
        { nameLower },
        { $setOnInsert: { name, nameLower, createdAt: new Date() } },
        { upsert: true }
      );

      const asistentes = await listaAsistentes(col);
      return res.status(200).json({ asistentes });
    }

    if (req.method === "DELETE") {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      const name = (body && body.name ? String(body.name) : "")
        .trim()
        .replace(/\s+/g, " ");

      if (!name) return res.status(400).json({ error: "Falta el nombre" });

      await col.deleteOne({ nameLower: name.toLowerCase() });

      const asistentes = await listaAsistentes(col);
      return res.status(200).json({ asistentes });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("Error en /api/rsvp:", err);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
