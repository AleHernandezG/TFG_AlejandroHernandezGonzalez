import dns from "dns";
import "dotenv/config";
import app from "./app";
import { conectarDB } from "./lib/db";
import { avisarSiElRemitenteFallaDMARC } from "./lib/email";

dns.setDefaultResultOrder("ipv4first");

const PUERTO = Number(process.env.PORT) || 4000;

async function arrancar(): Promise<void> {
  avisarSiElRemitenteFallaDMARC();
  await conectarDB();
  app.listen(PUERTO, () => {
    console.log(`Servidor arrancado en http://localhost:${PUERTO}`);
  });
}

arrancar();
