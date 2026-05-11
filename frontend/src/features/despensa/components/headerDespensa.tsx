interface Props {
  total: number
}

export function HeaderDespensa({ total }: Props) {
  return (
    <div className="px-5 pt-8 pb-4">
      <h1 className="text-[1.75rem] font-extrabold text-foreground leading-tight tracking-tight mb-1">
        ¡Bienvenido a tu{' '}
        <span className="font-black italic text-brand">Despensa</span>!
      </h1>
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'Tu despensa está vacía'
          : `${total} ${total === 1 ? 'ingrediente guardado' : 'ingredientes guardados'}`}
      </p>
    </div>
  )
}
