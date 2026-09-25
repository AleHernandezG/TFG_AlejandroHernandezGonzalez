const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const PUERTO_MONGO = 27018;
const PUERTO_API = 4000;
const BD = "cookr-pruebas-ui";

const CLAVES_REALES = [
  "CLOUDINARY_URL",
  "PEXELS_API_KEY",
  "EDAMAM_APP_ID",
  "EDAMAM_APP_KEY",
  "USDA_API_KEY",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GEMINI_BASE_URL",
  "GEMINI_PROXY_TOKEN",
  "GEMINI_MAX_LLAMADAS_DIA",
  "GOOGLE_CLIENT_ID",
];

const CLAVES_PROHIBIDAS = ["MONGODB_URI", "MAILJET_API_KEY", "MAILJET_SECRET_KEY"];

function comprobarQueNadieApuntaAAtlas() {
  const presentes = CLAVES_PROHIBIDAS.filter((k) => process.env[k]);
  if (presentes.length > 0) {
    console.error(
      `\nEste servidor no arranca con estas variables definidas: ${presentes.join(", ")}.\n` +
        `MONGODB_URI apuntaría a Atlas y MAILJET_* enviaría correos de verdad.\n`,
    );
    process.exit(1);
  }
}

function cargarClavesReales() {
  const ruta = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(ruta)) return [];

  const fichero = dotenv.parse(fs.readFileSync(ruta));
  const cargadas = [];
  for (const clave of CLAVES_REALES) {
    const valor = fichero[clave];
    if (valor) {
      process.env[clave] = valor;
      cargadas.push(clave);
    }
  }
  return cargadas;
}

async function arrancar() {
  comprobarQueNadieApuntaAAtlas();

  process.env.NODE_ENV = "development";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "pruebas-ui-local";
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  const cargadas = cargarClavesReales();

  const mongo = await MongoMemoryServer.create({
    instance: { port: PUERTO_MONGO, dbName: BD },
  });

  const uri = mongo.getUri(BD);
  await mongoose.connect(uri);

  const app = require(path.join(__dirname, "..", "dist", "app.js")).default;
  const servidor = app.listen(PUERTO_API, () => {
    console.log(`Backend de pruebas de UI en http://localhost:${PUERTO_API}`);
    console.log(`Mongo efímero en ${uri} (se borra al parar el proceso)`);
    console.log(`Servicios reales activos: ${cargadas.join(", ") || "ninguno"} — gastan cuota`);
    console.log("Correo desactivado: los registros no envían verificación.");
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
  console.error("El backend de pruebas de UI no pudo arrancar:", err);
  process.exit(1);
});
