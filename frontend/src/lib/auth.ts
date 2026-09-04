import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/services/authService";
import axios from "axios";

// ─── Extensión de tipos NextAuth ──────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      rol?: string;
      backendToken?: string;
      perfilCompleto?: boolean;
    };
  }
  interface JWT {
    backendToken?: string;
    rol?: string;
    perfilCompleto?: boolean;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const opcionesAuth: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        correo: { label: "Correo", type: "email" },
        contrasena: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) return null;

        try {
          const { token, usuario, perfilCompleto } = await authService.login({
            correo: credentials.correo,
            contrasena: credentials.contrasena,
          });

          const fotoUrl = usuario.foto && !usuario.foto.startsWith("data:") ? usuario.foto : null;
          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.correo,
            image: fotoUrl,
            backendToken: token,
            rol: usuario.rol,
            perfilCompleto,
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(
              error.response?.data?.error ?? "Error de autenticación",
            );
          }
          throw new Error("Error de autenticación");
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Credentials: primer login — user contiene los datos del authorize()
      if (user && account?.provider === "credentials") {
        token.sub = user.id;
        token.name = user.name;
        token.picture = user.image ?? null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.backendToken = (user as any).backendToken;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.rol = (user as any).rol;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.perfilCompleto = (user as any).perfilCompleto;
      }

      // Google OAuth: primer login — llamar al backend para crear/recuperar usuario
      if (user && account?.provider === "google") {
        const fotoValida =
          typeof user.image === "string" && /^https?:\/\//.test(user.image) ? user.image : undefined;
        const nombre = user.name?.trim() || user.email?.split("@")[0] || "Usuario";

        if (!account.id_token) {
          console.error("[NextAuth] Google no ha devuelto id_token");
          throw new Error("No se pudo iniciar sesión con Google.");
        }

        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
          });

          const result = await res.json().catch(() => null);
          if (!res.ok || !result?.usuario?.id) {
            console.error("[NextAuth] /auth/google respondió mal:", res.status, result);
            throw new Error(result?.error ?? "No se pudo iniciar sesión con Google.");
          }

          // Una foto base64 (data:) no cabe en la cookie de sesión y rompe el login.
          // Solo guardamos URLs; la foto subida vive en el perfil del backend.
          const fotoBackend =
            typeof result.usuario.foto === "string" && !result.usuario.foto.startsWith("data:")
              ? result.usuario.foto
              : null;

          token.sub = result.usuario.id;
          token.name = result.usuario.nombre ?? nombre;
          token.picture = fotoBackend ?? fotoValida ?? null;
          token.backendToken = result.token;
          token.rol = result.usuario.rol;
          token.perfilCompleto = result.perfilCompleto;
        } catch (err) {
          console.error("[NextAuth] Error llamando a POST /auth/google:", err);
          throw new Error("No se pudo conectar con el servidor. Inténtalo de nuevo.");
        }
      }

      // update() desde el cliente → actualizar campos en el token
      if (trigger === "update") {
        if (session?.perfilCompleto !== undefined) token.perfilCompleto = session.perfilCompleto;
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) {
          // Nunca metemos data: URIs (base64) en la cookie de sesión: la revientan.
          token.picture =
            typeof session.image === "string" && session.image.startsWith("data:")
              ? null
              : session.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.name = token.name as string | undefined;
        session.user.image = token.picture as string | null | undefined;
        session.user.backendToken = token.backendToken as string | undefined;
        session.user.rol = token.rol as string | undefined;
        session.user.perfilCompleto = token.perfilCompleto as boolean | undefined;
      }
      return session;
    },
  },
};
