'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { recetasService } from "@/services/recetasService";
import type { RespuestaFeed } from "@/services/recetasService";

export function useToggleGuardado(recetaId: string) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recetasService.toggleGuardado(recetaId, token),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["recetas", "feed"] })
      const snapshots = queryClient.getQueriesData<RespuestaFeed>({ queryKey: ["recetas", "feed"] })
      queryClient.setQueriesData<RespuestaFeed>(
        { queryKey: ["recetas", "feed"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            recetas: old.recetas.map((r) =>
              r.id === recetaId ? { ...r, guardado: !r.guardado } : r
            ),
          }
        }
      )
      return { snapshots }
    },

    onSuccess: (data) => {
      queryClient.setQueriesData<RespuestaFeed>(
        { queryKey: ["recetas", "feed"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            recetas: old.recetas.map((r) =>
              r.id === recetaId ? { ...r, guardado: data.guardado } : r
            ),
          }
        }
      )
    },

    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recetas", "feed"] })
      queryClient.invalidateQueries({ queryKey: ["recetas", "detalle", recetaId] })
    },
  });
}
