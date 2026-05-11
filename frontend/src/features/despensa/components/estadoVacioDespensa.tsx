import { ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onAnadir: () => void
}

export function EstadoVacioDespensa({ onAnadir }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--warm-bg)] flex items-center justify-center mb-6">
        <ShoppingBasket size={36} className="text-brand/50" />
      </div>
      <h2 className="text-lg font-extrabold text-foreground mb-2">
        Tu despensa está vacía
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        Añade los ingredientes que tienes en casa para llevar un mejor control de tu alimentación.
      </p>
      <Button
        onClick={onAnadir}
        className="h-12 px-8 rounded-2xl bg-brand text-brand-foreground font-bold"
      >
        Añadir primer ingrediente
      </Button>
    </div>
  )
}
