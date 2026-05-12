'use client'

import Image from 'next/image'

const ALERGENOS: Record<string, { label: string; imagen: string }> = {
  cereales:    { label: 'Cereales',     imagen: 'cereales'     },
  crustaceos:  { label: 'Crustáceos',  imagen: 'crustaceo'    },
  huevo:       { label: 'Huevo',        imagen: 'huevo'        },
  pescado:     { label: 'Pescado',      imagen: 'pescado'      },
  cacahuetes:  { label: 'Cacahuetes',  imagen: 'cacahuetes'   },
  soja:        { label: 'Soja',         imagen: 'soja'         },
  lacteos:     { label: 'Lácteos',      imagen: 'lacteos'      },
  frutosSecos: { label: 'Frutos secos', imagen: 'frutos-secos' },
  apio:        { label: 'Apio',         imagen: 'apio'         },
  mostaza:     { label: 'Mostaza',      imagen: 'mostaza'      },
  sesamo:      { label: 'Sésamo',       imagen: 'sesamo'       },
  sulfitos:    { label: 'Sulfitos',     imagen: 'sulfitos'     },
  moluscos:    { label: 'Moluscos',     imagen: 'moluscos'     },
  altramuz:    { label: 'Altramuz',     imagen: 'altramuz'     },
}

type Props = {
  alergenoId: string
  size?: 'sm' | 'md'
}

export function ChipAlergeno({ alergenoId, size = 'sm' }: Props) {
  const alergeno = ALERGENOS[alergenoId]
  if (!alergeno) return null

  if (size === 'sm') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive">
        <Image
          src={`/alergenos/${alergeno.imagen}.webp`}
          alt={alergeno.label}
          width={16}
          height={16}
          className="w-4 h-4 object-contain"
        />
        {alergeno.label}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
      <Image
        src={`/alergenos/${alergeno.imagen}.webp`}
        alt={alergeno.label}
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
      {alergeno.label}
    </span>
  )
}
