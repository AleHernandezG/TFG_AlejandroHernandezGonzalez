import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Opciones de configuración para NextAuth.
 * Se exportan para poder reutilizarlas en el route handler y en
 * getServerSession() desde Server Components / API Routes.
 *
 * TODO Fase 4: añadir CredentialsProvider cuando el backend tenga
 * el endpoint POST /api/auth/registro y POST /api/auth/login.
 */
export const opcionesAuth: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  /** Redirige a nuestras páginas personalizadas en lugar de las de NextAuth */
  pages: {
    signIn: "/login",
    newUser: "/registro",
    error: "/login",
  },

  /** Estrategia JWT — sin base de datos por ahora (Fase 1-3) */
  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * Enriquece la sesión con datos del token.
     * TODO Fase 4: añadir id de usuario del backend aquí.
     */
    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};
