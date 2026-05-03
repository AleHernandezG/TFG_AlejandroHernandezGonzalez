'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usuariosService } from "@/services/usuariosService";

export function useToggleSeguir(autorId: string, recetaId: string) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usuariosService.toggleSeguir(autorId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetas", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["recetas", "detalle", recetaId] });
    },
  });
}
