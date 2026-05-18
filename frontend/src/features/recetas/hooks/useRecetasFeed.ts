'use client'

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { recetasService, type FiltrosFeed } from "@/services/recetasService";
import type { FiltrosAvanzados } from "@/features/recetas/types/receta.types";

interface UseRecetasFeedParams {
  q?: string;
  filtrosAvanzados?: FiltrosAvanzados;
  pagina?: number;
  excluirPropio?: boolean;
  soloSiguiendo?: boolean;
  sort?: 'reciente' | 'likes';
}

export function useRecetasFeed({ q, filtrosAvanzados, pagina = 1, excluirPropio = false, soloSiguiendo = false, sort }: UseRecetasFeedParams = {}) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const filtros: FiltrosFeed = {
    q: q || undefined,
    dietas: filtrosAvanzados?.dietas?.length ? filtrosAvanzados.dietas : undefined,
    dificultad: filtrosAvanzados?.dificultad?.length ? filtrosAvanzados.dificultad : undefined,
    alergenos: filtrosAvanzados?.alergenos?.length ? filtrosAvanzados.alergenos : undefined,
    pagina,
    excluirPropio: excluirPropio && !!token,
    soloSiguiendo: soloSiguiendo && !!token,
    sort,
  };

  return useQuery({
    queryKey: ["recetas", "feed", q ?? "", filtrosAvanzados, pagina, excluirPropio, soloSiguiendo, sort, !!token],
    queryFn: () => recetasService.obtenerFeed(filtros, token),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
}
