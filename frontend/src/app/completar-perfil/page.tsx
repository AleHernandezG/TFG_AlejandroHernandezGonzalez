import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { opcionesAuth } from "@/lib/auth";
import { destinoTrasLogin } from "@/lib/destinoTrasLogin";
import { FormularioCompletarPerfil } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Completa tu perfil — Cookr",
};

type PropsPaginaCompletarPerfil = {
  searchParams: { callbackUrl?: string | string[] };
};

export default async function PaginaCompletarPerfil({ searchParams }: PropsPaginaCompletarPerfil) {
  const session = await getServerSession(opcionesAuth);
  const destino = destinoTrasLogin(searchParams.callbackUrl);

  if (!session) redirect("/login");
  if (session.user.perfilCompleto) redirect(destino);

  return <FormularioCompletarPerfil destino={destino} />;
}
