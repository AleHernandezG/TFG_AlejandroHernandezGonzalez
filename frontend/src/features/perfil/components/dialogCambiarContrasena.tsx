'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const esquema = z
  .object({
    contrasenaActual: z.string().min(1, 'Introduce tu contraseña actual'),
    contrasenaNueva: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmar: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.contrasenaNueva === d.confirmar, {
    path: ['confirmar'],
    message: 'Las contraseñas no coinciden',
  })

type Datos = z.infer<typeof esquema>

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function DialogCambiarContrasena({ abierto, onCerrar }: Props) {
  const [mostrarActual, setMostrarActual] = useState(false)
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [exito, setExito] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { contrasenaActual: '', contrasenaNueva: '', confirmar: '' },
  })

  function handleCerrar() {
    reset()
    setExito(false)
    onCerrar()
  }

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 600))
    setExito(true)
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && handleCerrar()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Cambiar contraseña</DialogTitle>
        </DialogHeader>

        {exito ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 size={48} className="text-[var(--chart-3)]" />
            <p className="text-sm font-medium text-foreground">
              ¡Contraseña actualizada correctamente!
            </p>
            <Button onClick={handleCerrar} className="w-full rounded-xl bg-brand text-brand-foreground font-bold">
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
            {/* Contraseña actual */}
            <div className="space-y-1.5">
              <Label htmlFor="contrasena-actual" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Contraseña actual
              </Label>
              <div className="relative">
                <Input
                  id="contrasena-actual"
                  type={mostrarActual ? 'text' : 'password'}
                  className="rounded-xl pr-9"
                  autoComplete="current-password"
                  {...register('contrasenaActual')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarActual((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarActual ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.contrasenaActual && (
                <p className="text-xs text-destructive">{errors.contrasenaActual.message}</p>
              )}
            </div>

            {/* Nueva contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="contrasena-nueva" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="contrasena-nueva"
                  type={mostrarNueva ? 'text' : 'password'}
                  className="rounded-xl pr-9"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  {...register('contrasenaNueva')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarNueva((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.contrasenaNueva && (
                <p className="text-xs text-destructive">{errors.contrasenaNueva.message}</p>
              )}
            </div>

            {/* Confirmar */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-contrasena" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmar-contrasena"
                type="password"
                className="rounded-xl"
                autoComplete="new-password"
                {...register('confirmar')}
              />
              {errors.confirmar && (
                <p className="text-xs text-destructive">{errors.confirmar.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-brand text-brand-foreground font-bold"
            >
              {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
