'use client'

import { useState } from 'react'
import { useDespensaStore } from '@/stores/despensaStore'
import { HeaderDespensa } from './headerDespensa'
import { BarraAnadirIngrediente } from './barraAnadirIngrediente'
import { ListaIngredientes } from './listaIngredientes'
import { EstadoVacioDespensa } from './estadoVacioDespensa'
import { SheetAnadirIngrediente } from './sheetAnadirIngrediente'
import { DialogEditarIngrediente } from './dialogEditarIngrediente'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

export function ContenidoDespensa() {
  const { ingredientes, añadir, editar, eliminar } = useDespensaStore()
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [itemEditando, setItemEditando] = useState<ItemDespensa | null>(null)

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
          onEliminar={eliminar}
        />
      )}

      <SheetAnadirIngrediente
        abierto={sheetAbierto}
        onCerrar={() => setSheetAbierto(false)}
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
            editar(itemEditando.id, cambios)
            setItemEditando(null)
          }}
        />
      )}
    </div>
  )
}
