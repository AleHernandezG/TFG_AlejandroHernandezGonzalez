'use client'

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { recetasService, type FiltrosFeed } from "@/services/recetasService";
import type { FiltrosAvanzados } from "@/features/recetas/types/receta.types";

interface UseRecetasFeedParams {
  q?: string;
  filtrosAvanzados?: FiltrosAvanzados;
  excluirPropio?: boolean;
  soloSiguiendo?: boolean;
  sort?: 'reciente' | 'likes' | 'score';
  enabled?: boolean;
}

export function useRecetasFeed({ q, filtrosAvanzados, excluirPropio = false, soloSiguiendo = false, sort, enabled = true }: UseRecetasFeedParams = {}) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  return useInfiniteQuery({
    queryKey: ["recetas", "feed", q ?? "", filtrosAvanzados, excluirPropio, soloSiguiendo, sort, !!token],
    queryFn: ({ pageParam = 1 }) => {
      const filtros: FiltrosFeed = {
        q: q || undefined,
        dietas: filtrosAvanzados?.dietas?.length ? filtrosAvanzados.dietas : undefined,
        dificultad: filtrosAvanzados?.dificultad?.length ? filtrosAvanzados.dificultad : undefined,
        alergenos: filtrosAvanzados?.alergenos?.length ? filtrosAvanzados.alergenos : undefined,
        pagina: pageParam as number,
        limite: 10,
        excluirPropio: excluirPropio && !!token,
        soloSiguiendo: soloSiguiendo && !!token,
        sort,
      };
      return recetasService.obtenerFeed(filtros, token);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalCargadas = allPages.reduce((acc, page) => acc + page.recetas.length, 0);
      return totalCargadas < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    placeholderData: (prev) => prev,
    enabled,
  });
}
