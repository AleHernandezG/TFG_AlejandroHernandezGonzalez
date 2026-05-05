import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DatoIngrediente } from '@/config/ingredientes'

interface IngredientesCustomStore {
  ingredientesCustom: DatoIngrediente[]
  añadir: (ingrediente: DatoIngrediente) => void
  buscarEnCustom: (query: string) => DatoIngrediente[]
  limpiar: () => void
}

export const useIngredientesCustomStore = create<IngredientesCustomStore>()(
  persist(
    (set, get) => ({
      ingredientesCustom: [],
      añadir: (ingrediente) =>
        set((state) => ({
          ingredientesCustom: state.ingredientesCustom.some(
            (i) => i.nombre === ingrediente.nombre
          )
            ? state.ingredientesCustom
            : [...state.ingredientesCustom, ingrediente],
        })),
      buscarEnCustom: (query) => {
        const q = query.toLowerCase()
        return get()
          .ingredientesCustom.filter(
            (i) =>
              i.nombre.toLowerCase().includes(q) ||
              i.aliases.some((a) => a.toLowerCase().includes(q))
          )
          .slice(0, 4)
      },
      limpiar: () => set({ ingredientesCustom: [] }),
    }),
    { name: 'cookr-ingredientes-custom' }
  )
)
