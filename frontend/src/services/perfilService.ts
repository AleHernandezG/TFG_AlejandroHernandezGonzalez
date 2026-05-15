import { apiClient } from './apiClient'

export interface PerfilRespuesta {
  nombre: string
  correo: string
  foto: string | null
  alergias: string[]
  preferencias: string[]
  proveedor: 'local' | 'google'
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export const perfilService = {
  async getMiPerfil(token: string): Promise<PerfilRespuesta> {
    const { data } = await apiClient.get<PerfilRespuesta>('/usuarios/me', {
      headers: headers(token),
    })
    return data
  },

  async cambiarContrasena(
    token: string,
    contrasenaActual: string,
    contrasenaNueva: string,
  ): Promise<void> {
    await apiClient.put(
      '/usuarios/me/contrasena',
      { contrasenaActual, contrasenaNueva },
      { headers: headers(token) },
    )
  },

  async actualizarPreferencias(
    token: string,
    dietas: string[],
    alergenos: string[],
  ): Promise<PerfilRespuesta> {
    const { data } = await apiClient.put<PerfilRespuesta>(
      '/usuarios/me/preferencias',
      { dietas, alergenos },
      { headers: headers(token) },
    )
    return data
  },
}
