import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import recetasRoutes from "./routes/recetas.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import despensaRoutes from "./routes/despensa.routes";
import ingredientesRoutes from "./routes/ingredientes.routes";
import chatRoutes from "./routes/chat.routes";
import { manejadorErrores } from "./middlewares/errores";


const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet()); //Esto es pa mas seguridad en las cabeceras HTTP
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev")); //Muestra las peticiones en consola para debuggear
}

// Solo acepta peticiones de una URL específica (la del frontend) y permite enviar cookies (credenciales)
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' })); // Pa parsear el cuerpo de las peticiones como JSON
app.use("/api/auth", authRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/despensa", despensaRoutes);
app.use("/api/ingredientes", ingredientesRoutes);
app.use("/api/chat", chatRoutes);

// GET /api/health — health check público (sin auth).
// Usado por scripts/keep-alive.sh para mantener Render free tier activo antes de demos.
// Responde 200 { estado: "ok", entorno } mientras el proceso esté vivo.
app.get("/api/health", (_req, res) => {
  res.json({ estado: "ok", entorno: process.env.NODE_ENV });
});

app.use(manejadorErrores); // Middleware para manejar errores de forma centralizada. Si alguna ruta lanza un error, este middleware lo captura y responde con un mensaje adecuado.

export default app;
