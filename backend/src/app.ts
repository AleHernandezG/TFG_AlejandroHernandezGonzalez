import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import { manejadorErrores } from "./middlewares/errores";

const app = express();

// ─── Seguridad y logging ───────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));

// ─── CORS ──────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

// ─── Body parsing ──────────────────────────────────────────
app.use(express.json());

// ─── Rutas ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Health check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ estado: "ok", entorno: process.env.NODE_ENV });
});

// ─── Error handler global (debe ir al final) ───────────────
app.use(manejadorErrores);

export default app;
