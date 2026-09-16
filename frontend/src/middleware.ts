export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    '/home',
    '/discover',
    '/despensa',
    '/perfil',
    '/chat',
    '/coleccion',
    '/crear-receta',
    '/crear-receta/revisar',
    '/editar-receta/:path*',
    '/recetas/:path*',
  ],
};
