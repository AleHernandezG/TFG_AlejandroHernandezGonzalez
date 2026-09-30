# 0001 · El detalle de receta es público

**Fecha:** 30 de septiembre de 2026 · **Estado:** aceptada · **Origen:** M5 de la auditoría, F8.4 del plan

## Contexto

El cliente y el servidor no decían lo mismo sobre quién puede ver una receta. El backend sirve
`GET /api/recetas/:id` con autenticación opcional: con token rellena `liked`, `guardado` y
`sigueAlAutor`, y sin token devuelve la receta igual. `CLAUDE.md` habla del «visitante anónimo» y
el filtro de alérgenos tiene un camino para él. Pero `/recetas/:path*` estaba en el `matcher` de
`frontend/src/middleware.ts`, así que nadie sin sesión llegaba nunca a esa página. Un enlace
compartido por WhatsApp acababa en el login, y la vista previa de Open Graph que genera
`generateMetadata` no la veía nadie que no tuviera cuenta.

## Decisión

El detalle de receta es público. `/recetas/:path*` sale del `matcher` y `/completar-perfil`
entra, que era una pantalla con sesión que se había quedado fuera.

Leer es libre y escribir pide sesión. Me gusta, guardar, añadir a la despensa y comentar mandan al
visitante a `/login?callbackUrl=/recetas/<id>` en vez de lanzar la petición y comerse un 401. Lo
hace `useAccionConSesion()` en `features/recetas/hooks/`. Mientras la sesión está cargando, el
clic no hace nada: mandar al login a alguien que sí tiene sesión es peor que un clic perdido.

## Alternativa descartada

Dejar el detalle con sesión y quitar el `optionalAuth` del backend para que los dos lados
coincidieran. Es más simple, pero cierra la única puerta de entrada de alguien que todavía no
tiene cuenta, que en una red social es justo la que hay que tener abierta. Y tiraría una parte del
backend que ya funciona y tiene tests.

## Consecuencias

- Cualquier cosa nueva en el detalle que llame a un endpoint autenticado tiene que pasar por
  `useAccionConSesion()` o comprobar la sesión antes. Si no, vuelve el 401 en silencio.
- `frontend/e2e/recetaPublica.spec.ts` abre una receta sin sesión a 1440 y a 390, comprueba que no
  sale ningún 401 y que cada acción lleva al login.
- El login no respeta todavía el `callbackUrl`: tras entrar, el usuario acaba en `/home` y no en la
  receta. Está en `docs/estado/pendientes.md`. Arreglarlo exige validar que el destino es una ruta
  interna, o se abre una redirección a cualquier sitio.
