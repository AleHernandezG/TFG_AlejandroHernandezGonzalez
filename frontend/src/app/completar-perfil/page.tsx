import { Metadata } from "next";
import { FormularioCompletarPerfil } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Completa tu perfil — Cookr",
};

export default function PaginaCompletarPerfil() {
  return <FormularioCompletarPerfil />;
}
