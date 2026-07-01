'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { recetasService } from "@/services/recetasService";
import type { RespuestaFeed } from "@/services/recetasService";

type CacheData = InfiniteData<RespuestaFeed> | RespuestaFeed;

function isInfiniteData(data: CacheData): data is InfiniteData<RespuestaFeed> {
  return data !== undefined && 'pages' in data;
}

export function useToggleGuardado(recetaId: string) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recetasService.toggleGuardado(recetaId, token),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["recetas", "feed"] })
      const snapshots = queryClient.getQueriesData<CacheData>({ queryKey: ["recetas", "feed"] })
      queryClient.setQueriesData<CacheData>(
        { queryKey: ["recetas", "feed"] },
        (old) => {
          if (!old) return old

          if (isInfiniteData(old)) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                recetas: page.recetas.map((r) =>
                  r.id === recetaId ? { ...r, guardado: !r.guardado } : r
                ),
              })),
            }
          }

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
      queryClient.setQueriesData<CacheData>(
        { queryKey: ["recetas", "feed"] },
        (old) => {
          if (!old) return old

          if (isInfiniteData(old)) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                recetas: page.recetas.map((r) =>
                  r.id === recetaId ? { ...r, guardado: data.guardado } : r
                ),
              })),
            }
          }

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
      queryClient.invalidateQueries({ queryKey: ['recetas', 'feed'] })
      queryClient.invalidateQueries({ queryKey: ['coleccion', 'guardadas'] })
    },
  });
}
