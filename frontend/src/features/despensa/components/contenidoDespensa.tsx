'use client'

import { useState } from 'react'
import { HeaderDespensa } from './headerDespensa'
import { BarraAnadirIngrediente } from './barraAnadirIngrediente'
import { ListaIngredientes } from './listaIngredientes'
import { EstadoVacioDespensa } from './estadoVacioDespensa'
import { SheetAnadirIngrediente } from './sheetAnadirIngrediente'
import { DialogEditarIngrediente } from './dialogEditarIngrediente'
import { useMiDespensa, useAñadirItem, useEditarItem, useEliminarItem } from '@/features/despensa/hooks/useMiDespensa'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

export function ContenidoDespensa() {
  const { data: ingredientes = [], isLoading } = useMiDespensa()
  const { mutate: añadir } = useAñadirItem()
  const { mutate: editar } = useEditarItem()
  const { mutate: eliminar } = useEliminarItem()

  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [itemEditando, setItemEditando] = useState<ItemDespensa | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando despensa…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <HeaderDespensa total={ingredientes.length} />

      <div className="px-5 pb-5">
        <BarraAnadirIngrediente onAbrir={() => setSheetAbierto(true)} />
      </div>

      {ingredientes.length === 0 ? (
        <EstadoVacioDespensa onAnadir={() => setSheetAbierto(true)} />
      ) : (
        <ListaIngredientes
          ingredientes={ingredientes}
          onEditar={setItemEditando}
          onEliminar={(id) => eliminar(id)}
        />
      )}

      <SheetAnadirIngrediente
        abierto={sheetAbierto}
        onCerrar={() => setSheetAbierto(false)}
        ingredientesExistentes={ingredientes}
        onAnadir={(item) => {
          añadir(item)
          setSheetAbierto(false)
        }}
      />

      {itemEditando && (
        <DialogEditarIngrediente
          item={itemEditando}
          onCerrar={() => setItemEditando(null)}
          onGuardar={(cambios) => {
            editar({ id: itemEditando.id, cambios })
            setItemEditando(null)
          }}
        />
      )}
    </div>
  )
}
