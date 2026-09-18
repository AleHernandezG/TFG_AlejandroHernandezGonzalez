'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'
import {
  AlergenosPrevisualizacion,
  CabeceraPrevisualizacion,
  HeroPrevisualizacion,
  IngredientesPrevisualizacion,
  MetaPrevisualizacion,
  PasosPrevisualizacion,
} from '../previsualizacion'
import type { IdPasoAsistente } from './pasos'

interface Props {
  paso: IdPasoAsistente
  fotoUrl: string | null
}

function Vacio({ texto }: { texto: string }) {
  return <p className="px-5 py-10 text-center text-sm text-muted-foreground">{texto}</p>
}

export function VistaPreviaPaso({ paso, fotoUrl }: Props) {
  const { control } = useFormContext<DatosCrearReceta>()
  const [titulo, descripcion, dietas, dificultad, tiempo, unidadTiempo, porciones, ingredientes, pasos] = useWatch({
    control,
    name: ['titulo', 'descripcion', 'dietas', 'dificultad', 'tiempo', 'unidadTiempo', 'porciones', 'ingredientes', 'pasos'],
  })

  const ingredientesEscritos = (ingredientes ?? []).filter((ing) => ing?.nombre?.trim())
  const pasosEscritos = (pasos ?? []).filter((p) => p?.texto?.trim())
  const alergenos = detectarAlergenos(ingredientesEscritos.map((ing) => ing.nombre))

  if (paso === 'foto') {
    return (
      <HeroPrevisualizacion
        src={fotoUrl}
        alt={titulo ?? ''}
        textoVacio="Sin foto, tu receta entra por la puerta de atrás"
        className="h-64 rounded-3xl"
      />
    )
  }

  if (paso === 'datos') {
    if (!titulo?.trim() && !descripcion?.trim() && !tiempo && !porciones) {
      return <Vacio texto="Lo que escribas aparece aquí, tal cual lo verán los demás." />
    }
    return (
      <>
        <CabeceraPrevisualizacion
          titulo={titulo ?? ''}
          descripcion={descripcion ?? ''}
          dietas={dietas ?? []}
          dificultad={dificultad}
          alergenos={alergenos}
          mostrarAutor={false}
        />
        <MetaPrevisualizacion
          tiempo={tiempo}
          unidadTiempo={unidadTiempo ?? 'min'}
          porciones={porciones}
          className="px-5 pb-6"
        />
      </>
    )
  }

  if (paso === 'ingredientes') {
    if (ingredientesEscritos.length === 0) {
      return <Vacio texto="Aún no has añadido ningún ingrediente." />
    }
    return <IngredientesPrevisualizacion ingredientes={ingredientesEscritos} />
  }

  if (paso === 'pasos') {
    if (pasosEscritos.length === 0) {
      return <Vacio texto="Aún no has escrito ningún paso." />
    }
    return <PasosPrevisualizacion pasos={pasosEscritos} />
  }

  if (alergenos.length === 0) {
    return <Vacio texto="No hemos detectado alérgenos en tus ingredientes." />
  }

  return <AlergenosPrevisualizacion alergenos={alergenos} />
}
