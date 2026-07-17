const path = require("path");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const PUERTO_MONGO = 27018;
const PUERTO_API = 4000;
const BD = "cookr-e2e";

const CLAVES_PROHIBIDAS = [
  "MONGODB_URI",
  "GEMINI_API_KEY",
  "PEXELS_API_KEY",
  "EDAMAM_APP_ID",
  "EDAMAM_APP_KEY",
  "USDA_API_KEY",
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
];

function comprobarEntornoLimpio() {
  const presentes = CLAVES_PROHIBIDAS.filter((k) => process.env[k]);
  if (presentes.length > 0) {
    console.error(
      `\nEl servidor E2E no arranca con estas variables definidas: ${presentes.join(", ")}.\n` +
        `Apuntarían a servicios reales (Atlas, Gemini, Pexels, Edamam, USDA, Mailjet).\n` +
        `Este proceso nunca carga backend/.env; si las ves aquí es que alguien las ha exportado a mano.\n`,
    );
    process.exit(1);
  }
}

async function arrancar() {
  comprobarEntornoLimpio();

  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-secret-local";
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  const mongo = await MongoMemoryServer.create({
    instance: { port: PUERTO_MONGO, dbName: BD },
  });

  const uri = mongo.getUri(BD);
  await mongoose.connect(uri);

  const app = require(path.join(__dirname, "..", "dist", "app.js")).default;
  const servidor = app.listen(PUERTO_API, () => {
    console.log(`Backend E2E en http://localhost:${PUERTO_API} — Mongo efímero en ${uri}`);
  });

  async function apagar() {
    servidor.close();
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  }

  process.on("SIGINT", apagar);
  process.on("SIGTERM", apagar);
}

arrancar().catch((err) => {
  console.error("El backend E2E no pudo arrancar:", err);
  process.exit(1);
});
