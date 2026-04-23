import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const perfilCompleto = req.nextauth.token?.perfilCompleto;

    // Logueado sin perfil completo → forzar completar-perfil
    if (perfilCompleto === false && pathname !== "/completar-perfil") {
      return NextResponse.redirect(new URL("/completar-perfil", req.url));
    }

    // Logueado con perfil completo intentando entrar a completar-perfil → home
    if (perfilCompleto === true && pathname === "/completar-perfil") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // false → NextAuth redirige automáticamente a /login (configurado en pages.signIn)
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/home/:path*",
    "/coleccion/:path*",
    "/recetas/:path*",
    "/completar-perfil/:path*",
  ],
};
