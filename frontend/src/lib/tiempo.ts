export function tiempoRelativo(fechaIso: string): string {
  const transcurrido = Math.max(0, Date.now() - new Date(fechaIso).getTime())
  const mins = Math.floor(transcurrido / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias} d`
}
