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

app.use(helmet());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);

const jsonEstandar = express.json({ limit: "100kb" });
const jsonConImagen = express.json({ limit: "10mb" });

app.use("/api/auth", jsonEstandar, authRoutes);
app.use("/api/recetas", jsonConImagen, recetasRoutes);
app.use("/api/usuarios", jsonConImagen, usuariosRoutes);
app.use("/api/despensa", jsonConImagen, despensaRoutes);
app.use("/api/ingredientes", jsonEstandar, ingredientesRoutes);
app.use("/api/chat", jsonConImagen, chatRoutes);

// GET /api/health — health check público (sin auth).
// Usado por scripts/keep-alive.sh para mantener Render free tier activo antes de demos.
// Responde 200 { estado: "ok", entorno } mientras el proceso esté vivo.
app.get("/api/health", (_req, res) => {
  res.json({ estado: "ok", entorno: process.env.NODE_ENV });
});

app.use(manejadorErrores);

export default app;
