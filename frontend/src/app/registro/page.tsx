import type { Metadata } from "next";
import { FormularioRegistro } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Crear cuenta — Gastronómica",
  description:
    "Únete a la comunidad gastronómica. Crea tu cuenta gratis y empieza a descubrir recetas personalizadas.",
};

/**
 * Página de registro — /registro
 *
 * Server Component: exporta metadata y renderiza el FormularioRegistro
 * (Client Component) sobre un fondo decorativo con gradientes sutiles
 * consistentes con el diseño de la landing page.
 */
export default function PaginaRegistro() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* ── Fondo decorativo ──────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        {/* Blob superior centrado — tono brand */}
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
        {/* Blob inferior derecho — tono cálido */}
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-amber-300/8 blur-3xl" />
        {/* Blob inferior izquierdo — tono suave */}
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-brand/4 blur-2xl" />
      </div>

      {/* ── Tarjeta de registro ───────────────────────────────────────── */}
      <div className="w-full max-w-md">
        <FormularioRegistro />
      </div>
    </main>
  );
}
