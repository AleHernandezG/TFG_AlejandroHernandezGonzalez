import "dotenv/config";
import app from "./app";
import { conectarDB } from "./lib/db";

const PUERTO = Number(process.env.PORT) || 4000;

async function arrancar(): Promise<void> {
  await conectarDB();
  app.listen(PUERTO, () => {
    console.log(`🚀 Servidor arrancado en http://localhost:${PUERTO}`);
  });
}

arrancar();
