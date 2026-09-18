import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'

export type BorradorReceta = Omit<Partial<DatosCrearReceta>, 'foto'>

interface EstadoCrearReceta {
  datos: DatosCrearReceta | null
  fotoPreview: string | null
  borrador: BorradorReceta | null
  guardadoEn: number | null
  setDatos: (d: DatosCrearReceta) => void
  setFoto: (url: string | null) => void
  guardarBorrador: (b: BorradorReceta) => void
  descartarBorrador: () => void
  limpiar: () => void
}

export const useCrearRecetaStore = create<EstadoCrearReceta>()(
  persist(
    (set) => ({
      datos: null,
      fotoPreview: null,
      borrador: null,
      guardadoEn: null,
      setDatos: (d) => set({ datos: d }),
      setFoto: (url) => set({ fotoPreview: url }),
      guardarBorrador: (b) => set({ borrador: b, guardadoEn: Date.now() }),
      descartarBorrador: () => set({ borrador: null, guardadoEn: null, fotoPreview: null }),
      limpiar: () =>
        set({ datos: null, fotoPreview: null, borrador: null, guardadoEn: null }),
    }),
    {
      name: 'cookr-borrador-receta',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ borrador, fotoPreview, guardadoEn }) => ({
        borrador,
        fotoPreview,
        guardadoEn,
      }),
    },
  ),
)
