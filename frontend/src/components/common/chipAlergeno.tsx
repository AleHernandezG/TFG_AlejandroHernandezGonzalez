'use client'

import Image from 'next/image'

const ALERGENOS: Record<string, { label: string }> = {
  gluten:      { label: 'Gluten'        },
  crustaceos:  { label: 'Crustáceos'   },
  huevo:       { label: 'Huevo'         },
  pescado:     { label: 'Pescado'       },
  cacahuetes:  { label: 'Cacahuetes'   },
  soja:        { label: 'Soja'          },
  lacteos:     { label: 'Lácteos'       },
  frutosSecos: { label: 'Frutos secos' },
  apio:        { label: 'Apio'          },
  mostaza:     { label: 'Mostaza'       },
  sesamo:      { label: 'Sésamo'        },
  sulfitos:    { label: 'Sulfitos'      },
  moluscos:    { label: 'Moluscos'      },
  altramuz:    { label: 'Altramuz'      },
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
          src={`/alergenos/${alergenoId}.webp`}
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
        src={`/alergenos/${alergenoId}.webp`}
        alt={alergeno.label}
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
      {alergeno.label}
    </span>
  )
}
