"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectorChips } from "@/components/common/selectorChips";
import { ALERGENOS_OPCIONES, DIETAS_OPCIONES } from "@/config/opcionesUsuario";

/**
 * Formulario de onboarding post-registro.
 * El usuario selecciona sus alergias/intolerancias y preferencias de dieta.
 *
 * TODO [Fase 5]: antes del router.push, llamar a
 *   usuariosService.actualizarPerfil({ alergenos, dietas })
 */
export function FormularioCompletarPerfil() {
  const router = useRouter();
  const [alergenos, setAlergenos] = useState<string[]>([]);
  const [dietas, setDietas] = useState<string[]>([]);

  const handleListo = () => {
    // TODO [Fase 5]: await usuariosService.actualizarPerfil({ alergenos, dietas })
    router.push("/home");
  };

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-5 pt-10 pb-8 max-w-lg mx-auto w-full">

        {/* Progreso */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">Paso 2 de 2</p>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-brand h-1 rounded-full w-full" />
          </div>
        </div>

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Cuéntanos sobre ti
          </h1>
          <p className="text-sm text-muted-foreground">
            Así personalizamos tu experiencia
          </p>
        </div>

        {/* Sección alérgenos */}
        <section className="mb-6">
          <p className="text-base font-semibold text-foreground mb-3">
            ¿Tienes alguna alergia o intolerancia?
          </p>
          <SelectorChips
            opciones={ALERGENOS_OPCIONES}
            seleccionados={alergenos}
            onChange={setAlergenos}
          />
        </section>

        {/* Separador tonal */}
        <div className="h-px bg-border/50 my-6" />

        {/* Sección dietas */}
        <section className="mb-8">
          <p className="text-base font-semibold text-foreground mb-3">
            ¿Qué tipo de cocina prefieres?
          </p>
          <SelectorChips
            opciones={DIETAS_OPCIONES}
            seleccionados={dietas}
            onChange={setDietas}
          />
        </section>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-3">
          <p className="text-xs text-muted-foreground text-center">
            Puedes cambiar esto en cualquier momento desde Ajustes
          </p>
          <Button
            onClick={handleListo}
            className="w-full rounded-full py-3 font-semibold text-base bg-brand text-brand-foreground hover:bg-brand/90 h-auto"
          >
            Listo
          </Button>
        </div>

      </div>
    </div>
  );
}
