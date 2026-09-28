'use client'

import type { MouseEvent } from 'react'

export function EnlaceSaltoContenido() {
  function saltar(e: MouseEvent<HTMLAnchorElement>) {
    const destino = document.getElementById('contenido') ?? document.querySelector('main')
    if (!destino) return
    e.preventDefault()
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1')
    destino.focus()
  }

  return (
    <a
      href="#contenido"
      onClick={saltar}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-brand-foreground focus:shadow-lg"
    >
      Saltar al contenido
    </a>
  )
}
