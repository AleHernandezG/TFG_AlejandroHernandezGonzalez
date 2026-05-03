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

          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.correo,
            image: usuario.foto ?? null,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.backendToken = (user as any).backendToken;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.rol = (user as any).rol;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.perfilCompleto = (user as any).perfilCompleto;
      }

      // Google OAuth: primer login — llamar al backend para crear/recuperar usuario
      if (user && account?.provider === "google") {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              correo: user.email,
              nombre: user.name,
              foto: user.image ?? undefined,
            }),
          });
          const result = await res.json();
          token.sub = result.usuario.id;
          token.backendToken = result.token;
          token.rol = result.usuario.rol;
          token.perfilCompleto = result.perfilCompleto;
        } catch (err) {
          console.error("[NextAuth] Error llamando a POST /auth/google:", err);
          throw new Error("No se pudo conectar con el servidor. Inténtalo de nuevo.");
        }
      }

      // update() desde el cliente → actualizar perfilCompleto en el token
      if (trigger === "update" && session?.perfilCompleto !== undefined) {
        token.perfilCompleto = session.perfilCompleto;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.backendToken = token.backendToken as string | undefined;
        session.user.rol = token.rol as string | undefined;
        session.user.perfilCompleto = token.perfilCompleto as boolean | undefined;
      }
      return session;
    },
  },
};
