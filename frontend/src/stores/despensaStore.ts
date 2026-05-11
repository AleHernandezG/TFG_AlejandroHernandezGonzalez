import { create } from 'zustand'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'
import { DATOS_DESPENSA_MOCK } from '@/features/despensa/data/datosDespensa'

interface DespensaState {
  ingredientes: ItemDespensa[]
  añadir: (item: Omit<ItemDespensa, 'id'>) => void
  editar: (id: string, cambios: Partial<Omit<ItemDespensa, 'id'>>) => void
  eliminar: (id: string) => void
}

export const useDespensaStore = create<DespensaState>((set) => ({
  ingredientes: DATOS_DESPENSA_MOCK,

  añadir: (item) =>
    set((state) => ({
      ingredientes: [
        ...state.ingredientes,
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
      ],
    })),

  editar: (id, cambios) =>
    set((state) => ({
      ingredientes: state.ingredientes.map((ing) =>
        ing.id === id ? { ...ing, ...cambios } : ing
      ),
    })),

  eliminar: (id) =>
    set((state) => ({
      ingredientes: state.ingredientes.filter((ing) => ing.id !== id),
    })),
}))
