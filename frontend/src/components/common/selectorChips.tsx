"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface OpcionChip {
  id: string;
  label: string;
  icono?: string;
}

interface PropsSelectorChips {
  opciones: readonly OpcionChip[];
  seleccionados: string[];
  onChange: (seleccionados: string[]) => void;
  max?: number;
}

/**
 * Selector múltiple por chips.
 * Reutilizable en: /completar-perfil, /ajustes, filtros de búsqueda.
 */
export function SelectorChips({
  opciones,
  seleccionados,
  onChange,
  max,
}: PropsSelectorChips) {
  const toggleOpcion = (id: string) => {
    if (seleccionados.includes(id)) {
      onChange(seleccionados.filter((s) => s !== id));
    } else {
      if (max !== undefined && seleccionados.length >= max) return;
      onChange([...seleccionados, id]);
    }
  };

  const limiteAlcanzado =
    max !== undefined && seleccionados.length >= max;

  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const activo = seleccionados.includes(opcion.id);
        const deshabilitado = !activo && limiteAlcanzado;

        return (
          <motion.button
            key={opcion.id}
            type="button"
            onClick={() => toggleOpcion(opcion.id)}
            disabled={deshabilitado}
            whileTap={!deshabilitado ? { scale: 1.05 } : undefined}
            animate={activo ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1.5",
              "text-sm font-medium border transition-colors",
              activo
                ? "bg-brand text-brand-foreground border-brand"
                : "bg-muted text-muted-foreground border-border",
              deshabilitado ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {opcion.icono && (
              <Image
                src={opcion.icono}
                width={16}
                height={16}
                alt=""
                aria-hidden="true"
                className="shrink-0"
              />
            )}
            {opcion.label}
          </motion.button>
        );
      })}
    </div>
  );
}
