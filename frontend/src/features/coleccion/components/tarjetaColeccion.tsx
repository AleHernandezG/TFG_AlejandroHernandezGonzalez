'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToggleGuardado } from '@/features/recetas/hooks/useToggleGuardado'
import { useEliminarReceta } from '@/features/coleccion/hooks/useEliminarReceta'
import type { PestanaColeccion, RecetaColeccion } from '@/features/coleccion/types/coleccion.types'

interface Props {
  receta: RecetaColeccion
  pestana: PestanaColeccion
}

export function TarjetaColeccion({ receta, pestana }: Props) {
  const router = useRouter()
  const [guardado, setGuardado] = useState(true)
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [eliminada, setEliminada] = useState(false)

  const { mutate: toggleGuardado } = useToggleGuardado(receta.id)
  const { mutate: eliminar, isPending } = useEliminarReceta()

  if (eliminada) return null
  if (pestana === 'guardadas' && !guardado) return null

  function handleDesguardar(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setGuardado(false)
    toggleGuardado(undefined, {
      onError: () => setGuardado(true),
    })
  }

  function handleAbrirSheet(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSheetAbierto(true)
  }

  function handleEliminar() {
    eliminar(receta.id, {
      onSuccess: () => {
        setConfirmando(false)
        setEliminada(true)
      },
    })
  }

  return (
    <>
      <Link href={`/recetas/${receta.id}`} className="block">
        <article className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer bg-muted shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
          <Image
            src={receta.imagenUrl || '/images/recetas/crearRecetaImagen.webp'}
            alt={receta.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
            unoptimized={receta.imagenUrl?.startsWith('data:')}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

          {pestana === 'guardadas' ? (
            <button
              aria-label="Quitar de guardadas"
              onClick={handleDesguardar}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-brand shadow-sm hover:scale-110 transition-transform"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              aria-label="Opciones de la receta"
              onClick={handleAbrirSheet}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}

          <div className="absolute bottom-0 left-0 w-full p-4 z-20">
            <h3 className="font-bold text-white text-base leading-tight mb-2 drop-shadow-sm">
              {receta.titulo}
            </h3>
            <div className="flex items-center gap-2">
              {receta.autor.avatarUrl ? (
                <Image
                  src={receta.autor.avatarUrl}
                  alt={receta.autor.nombre}
                  width={20}
                  height={20}
                  className="rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand/40 border border-white/20 flex-shrink-0" />
              )}
              <span className="text-white/90 text-xs font-medium">{receta.autor.nombre}</span>
            </div>
          </div>
        </article>
      </Link>

      {/* Sheet de opciones — solo en mis-recetas */}
      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-sm font-bold truncate">
              {receta.titulo}
            </SheetTitle>
          </SheetHeader>

          <button
            onClick={() => { setSheetAbierto(false); setConfirmando(true) }}
            className="flex items-center gap-3 w-full px-1 py-3 text-sm font-medium text-destructive hover:opacity-80 transition-opacity"
          >
            <Trash2 size={18} />
            Eliminar receta
          </button>

          <button
            onClick={() => { setSheetAbierto(false); router.push(`/editar-receta/${receta.id}`) }}
            className="flex items-center gap-3 w-full px-1 py-3 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
          >
            <Pencil size={18} />
            Editar receta
          </button>
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>¿Eliminar receta?</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmando(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleEliminar}
              disabled={isPending}
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
