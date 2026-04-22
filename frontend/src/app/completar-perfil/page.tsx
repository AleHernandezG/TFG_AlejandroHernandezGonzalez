import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { opcionesAuth } from "@/lib/auth";
import { FormularioCompletarPerfil } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Completa tu perfil — Cookr",
};

export default async function PaginaCompletarPerfil() {
  const session = await getServerSession(opcionesAuth);

  if (!session) redirect("/login");
  if (session.user.perfilCompleto) redirect("/home");

  return <FormularioCompletarPerfil />;
}
