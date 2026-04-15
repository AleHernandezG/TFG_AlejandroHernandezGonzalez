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
    };
  }
  interface JWT {
    backendToken?: string;
    rol?: string;
  }
}

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
          const { token, usuario } = await authService.login({
            correo: credentials.correo,
            contrasena: credentials.contrasena,
          });

          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.correo,
            image: usuario.foto ?? null,
            // Campos extra — se propagan en el callback jwt
            backendToken: token,
            rol: usuario.rol,
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
    newUser: "/completar-perfil",
    error: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.backendToken = (user as any).backendToken;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.rol = (user as any).rol;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.backendToken = token.backendToken as string | undefined;
        session.user.rol = token.rol as string | undefined;
      }
      return session;
    },
  },
};
