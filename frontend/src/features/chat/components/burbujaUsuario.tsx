interface Props {
  contenido: string
  timestamp: Date
}

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function BurbujaUsuario({ contenido, timestamp }: Props) {
  return (
    <div className="flex w-full justify-end">
      <div className="flex max-w-[85%] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-tr-sm bg-brand px-5 py-3 shadow-sm">
          <p className="text-sm leading-relaxed text-brand-foreground">{contenido}</p>
        </div>
        <span
          suppressHydrationWarning
          className="px-1 text-[11px] text-muted-foreground"
        >
          {formatearHora(timestamp)}
        </span>
      </div>
    </div>
  )
}
