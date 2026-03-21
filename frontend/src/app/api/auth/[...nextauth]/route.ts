import NextAuth from "next-auth";
import { opcionesAuth } from "@/lib/auth";

/**
 * Route handler de NextAuth para App Router.
 * Gestiona todos los endpoints de /api/auth/*:
 *   - /api/auth/signin
 *   - /api/auth/callback/google
 *   - /api/auth/session
 *   - /api/auth/signout
 *   - etc.
 */
const manejador = NextAuth(opcionesAuth);

export { manejador as GET, manejador as POST };
