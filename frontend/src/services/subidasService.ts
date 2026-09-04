import axios from 'axios'
import { apiClient } from './apiClient'

const MAX_BYTES = 10 * 1024 * 1024

export type TipoSubida = 'receta' | 'avatar'

interface FirmaSubida {
  url: string
  campos: Record<string, string>
}

export const subidasService = {
  async subirImagen(fichero: File, tipo: TipoSubida, token: string): Promise<string> {
    if (fichero.size > MAX_BYTES) {
      throw new Error('La imagen no puede superar los 10 MB')
    }

    const { data: firma } = await apiClient.post<FirmaSubida>(
      '/subidas/firma',
      { tipo },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    const formulario = new FormData()
    formulario.append('file', fichero)
    for (const [clave, valor] of Object.entries(firma.campos)) {
      formulario.append(clave, valor)
    }

    const { data } = await axios.post<{ secure_url: string }>(firma.url, formulario)
    return data.secure_url
  },
}
