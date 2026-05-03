'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { recetasService } from "@/services/recetasService";

export function useAgregarComentario(recetaId: string) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (texto: string) => recetasService.agregarComentario(recetaId, texto, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetas", "detalle", recetaId] });
    },
  });
}
