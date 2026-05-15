'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Lock, UtensilsCrossed, MapPin, Camera, Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePerfilStore } from '@/stores/perfilStore'
import { useMiPerfil } from '@/features/perfil/hooks/usePerfil'
import { TarjetaAvatarPerfil } from './tarjetaAvatarPerfil'
import { GrupoAjustes } from './grupoAjustes'
import { FilaAjuste } from './filaAjuste'
import { FilaTogglePermiso } from './filaTogglePermiso'
import { DialogCambiarContrasena } from './dialogCambiarContrasena'
import { DialogPreferenciasAlergenos } from './dialogPreferenciasAlergenos'

export function ContenidoPerfil() {
  const { data: session } = useSession()
  const { permisos, togglePermiso } = usePerfilStore()
  const { data: perfil } = useMiPerfil()

  const [dialogContrasena, setDialogContrasena] = useState(false)
  const [dialogPreferencias, setDialogPreferencias] = useState(false)

  const nombre = session?.user?.name ?? ''
  const email = session?.user?.email ?? ''
  const avatar = session?.user?.image ?? null
  const esLocal = perfil?.proveedor === 'local'

  async function handleCerrarSesion() {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-background/80 border-border/30 sticky top-0 z-50 flex w-full items-center justify-center border-b px-6 py-5 backdrop-blur-md">
        <h1 className="text-sm font-extrabold uppercase tracking-[0.12em] text-foreground">
          Perfil
        </h1>
      </header>

      <div className="space-y-6 px-5 py-6">
        {/* Tarjeta avatar */}
        <TarjetaAvatarPerfil nombre={nombre} email={email} avatar={avatar} />

        {/* Grupo: Cuenta */}
        <GrupoAjustes titulo="Cuenta">
          {esLocal && (
            <FilaAjuste
              icono={Lock}
              label="Cambiar contraseña"
              onClick={() => setDialogContrasena(true)}
            />
          )}
          <FilaAjuste
            icono={UtensilsCrossed}
            label="Cambiar preferencias y alérgenos"
            onClick={() => setDialogPreferencias(true)}
            separador={false}
          />
        </GrupoAjustes>

        {/* Grupo: Permisos */}
        <GrupoAjustes titulo="Permisos">
          <FilaTogglePermiso
            icono={MapPin}
            label="Localización"
            activo={permisos.ubicacion}
            onToggle={() => togglePermiso('ubicacion')}
          />
          <FilaTogglePermiso
            icono={Camera}
            label="Cámara"
            activo={permisos.camara}
            onToggle={() => togglePermiso('camara')}
          />
          <FilaTogglePermiso
            icono={Bell}
            label="Notificaciones"
            activo={permisos.notificaciones}
            onToggle={() => togglePermiso('notificaciones')}
            separador={false}
          />
        </GrupoAjustes>

        {/* Grupo: Sesión */}
        <GrupoAjustes titulo="Sesión">
          <button
            onClick={handleCerrarSesion}
            className="hover:bg-destructive/5 flex w-full items-center justify-center gap-2.5 px-4 py-4 text-destructive transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </GrupoAjustes>

        {/* Botón guardar */}
        <div className="border-border/20 border-t pt-4">
          <Button
            onClick={() => window.history.back()}
            className="h-12 w-full rounded-full bg-brand font-bold text-brand-foreground"
          >
            Guardar cambios
          </Button>
        </div>

        {/* Footer */}
        <footer className="space-y-0.5 pt-6 text-center">
          <p className="text-muted-foreground/60 text-[11px]">Cookr v1.0.0</p>
          <p className="text-muted-foreground/40 text-[10px]">TFG · Alejandro Hernández</p>
        </footer>
      </div>

      {/* Dialogs */}
      <DialogCambiarContrasena
        abierto={dialogContrasena}
        onCerrar={() => setDialogContrasena(false)}
      />
      <DialogPreferenciasAlergenos
        abierto={dialogPreferencias}
        onCerrar={() => setDialogPreferencias(false)}
      />
    </div>
  )
}
