import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import recetasRoutes from "./routes/recetas.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import { manejadorErrores } from "./middlewares/errores";


const app = express();

app.use(helmet()); //Esto es pa mas seguridad en las cabeceras HTTP
app.use(morgan("dev")); //Muestra las peticiones en consola para debuggear

// Solo acepta peticiones de una URL específica (la del frontend) y permite enviar cookies (credenciales)
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json()); // Pa parsear el cuerpo de las peticiones como JSON
app.use("/api/auth", authRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/usuarios", usuariosRoutes);

// GET /api/health — health check público (sin auth).
// Usado por scripts/keep-alive.sh para mantener Render free tier activo antes de demos.
// Responde 200 { estado: "ok", entorno } mientras el proceso esté vivo.
app.get("/api/health", (_req, res) => {
  res.json({ estado: "ok", entorno: process.env.NODE_ENV });
});

app.use(manejadorErrores); // Middleware para manejar errores de forma centralizada. Si alguna ruta lanza un error, este middleware lo captura y responde con un mensaje adecuado.

export default app;
