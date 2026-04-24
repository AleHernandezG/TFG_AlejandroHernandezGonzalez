import { create } from 'zustand'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'

interface EstadoCrearReceta {
  datos: DatosCrearReceta | null
  fotoPreview: string | null
  setDatos: (d: DatosCrearReceta) => void
  setFoto: (url: string | null) => void
  limpiar: () => void
}

export const useCrearRecetaStore = create<EstadoCrearReceta>((set) => ({
  datos: null,
  fotoPreview: null,
  setDatos: (d) => set({ datos: d }),
  setFoto: (url) => set({ fotoPreview: url }),
  limpiar: () => set({ datos: null, fotoPreview: null }),
}))
