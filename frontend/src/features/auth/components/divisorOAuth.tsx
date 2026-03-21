import { Separator } from "@/components/ui/separator";

interface PropsDivisorOAuth {
  /** Texto central del divisor */
  texto?: string;
}

/** Divisor visual entre el botón OAuth y el formulario de email */
export function DivisorOAuth({ texto = "o continúa con correo" }: PropsDivisorOAuth) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={texto}>
      <Separator className="flex-1" />
      <span className="shrink-0 text-xs text-muted-foreground">{texto}</span>
      <Separator className="flex-1" />
    </div>
  );
}
