'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { recetasService } from "@/services/recetasService";

export function useToggleGuardado(recetaId: string) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recetasService.toggleGuardado(recetaId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetas", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["recetas", "detalle", recetaId] });
    },
  });
}
