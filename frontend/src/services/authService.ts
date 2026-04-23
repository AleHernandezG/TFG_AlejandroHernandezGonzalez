import { apiClient } from "./apiClient";

export interface RespuestaLogin {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    foto?: string;
    rol: string;
  };
  perfilCompleto: boolean;
}

export const authService = {
  async registro(datos: {
    nombre: string;
    correo: string;
    contrasena: string;
  }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>(
      "/auth/registro",
      datos,
    );
    return data;
  },

  async login(datos: {
    correo: string;
    contrasena: string;
  }): Promise<RespuestaLogin> {
    const { data } = await apiClient.post<RespuestaLogin>(
      "/auth/login",
      datos,
    );
    return data;
  },

  async recuperarContrasena(datos: {
    correo: string;
  }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>(
      "/auth/recuperar-contrasena",
      datos,
    );
    return data;
  },

  async nuevaContrasena(datos: {
    token: string;
    contrasena: string;
  }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>(
      "/auth/nueva-contrasena",
      datos,
    );
    return data;
  },

  async verificarEmail(datos: { token: string }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>(
      "/auth/verificar-email",
      datos,
    );
    return data;
  },

  async completarPerfil(
    datos: { alergias: string[]; preferencias: string[] },
    token: string,
  ): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>(
      "/auth/completar-perfil",
      datos,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },

  async reenviarVerificacion(correo: string): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>(
      "/auth/verificar-email/reenviar",
      { correo },
    );
    return data;
  },
};
