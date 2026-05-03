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
}

export function useRecetasFeed({ q, filtrosAvanzados, pagina = 1, excluirPropio = false }: UseRecetasFeedParams = {}) {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const filtros: FiltrosFeed = {
    q: q || undefined,
    dificultad: filtrosAvanzados?.dificultad?.length ? filtrosAvanzados.dificultad : undefined,
    alergenos: filtrosAvanzados?.alergenos?.length ? filtrosAvanzados.alergenos : undefined,
    pagina,
    excluirPropio: excluirPropio && !!token,
  };

  return useQuery({
    queryKey: ["recetas", "feed", q ?? "", filtrosAvanzados, pagina, excluirPropio],
    queryFn: () => recetasService.obtenerFeed(filtros, token),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}
