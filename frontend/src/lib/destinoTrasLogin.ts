export const DESTINO_POR_DEFECTO = '/home'

// El destino llega en la URL (?callbackUrl=), así que lo puede escribir cualquiera.
// Solo vale una ruta interna; todo lo demás cae en /home o el login sería una
// redirección abierta a cualquier web.
export function destinoTrasLogin(valor: unknown): string {
  if (typeof valor !== 'string') return DESTINO_POR_DEFECTO
  if (!valor.startsWith('/')) return DESTINO_POR_DEFECTO
  if (valor.startsWith('//') || valor.startsWith('/\\')) return DESTINO_POR_DEFECTO
  // El navegador quita tabuladores y saltos de línea de una URL: "/\t/web.com" acaba en "//web.com".
  if (/[\t\n\r]/.test(valor)) return DESTINO_POR_DEFECTO
  return valor
}

export function rutaCompletarPerfil(destino: string): string {
  const seguro = destinoTrasLogin(destino)
  if (seguro === DESTINO_POR_DEFECTO) return '/completar-perfil'
  return `/completar-perfil?callbackUrl=${encodeURIComponent(seguro)}`
}
