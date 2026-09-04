# Correcciones tras la revisión de UI (junio 2026)

Ronda de arreglos a partir del feedback de pruebas (`docs/PRUEBAS_UI.pdf`) y de errores detectados en producción (Vercel + Render). Cada bloque explica el problema, la causa real y la solución, con los archivos tocados, para poder trasladarlo a la memoria.

---

## 1. El chat con IA no respondía en producción

**Síntoma:** "No pude conectar con el asistente" en la web desplegada.

**Causa:** no era un fallo de conexión. El log de Render mostraba un `429 Too Many Requests` de Gemini con `limit: 0` para `gemini-2.0-flash`. Google retiró la cuota gratuita de ese modelo. Lo confirmé probando la API con la clave del proyecto: `gemini-2.0-flash` devolvía 429 y `gemini-2.5-flash` respondía con normalidad.

**Solución:**
- Modelo por defecto cambiado a `gemini-2.5-flash`.
- Desactivado el modo *thinking* (`thinkingBudget: 0`): gastaba cientos de tokens por respuesta sin aportar nada en un chat culinario, y consumía cuota.
- Manejo específico del error 429 con un mensaje claro para el usuario.

**Archivos:** `backend/src/services/chatService.ts`, `backend/.env`. En Render hubo que actualizar la variable `GEMINI_MODEL`.

---

## 2. Favicon por defecto de Next.js

**Causa:** el `favicon.ico` que se servía era el de la plantilla de Next.

**Solución:** eliminado el `favicon.ico` por defecto y creado `icon.svg` (gorro de chef sobre el color de marca terracota). En el App Router, Next genera el `<link rel="icon">` automáticamente a partir de ese archivo y los navegadores modernos prefieren el SVG.

**Archivos:** `frontend/src/app/icon.svg` (nuevo), borrado `frontend/src/app/favicon.ico`.

---

## 3. Home vacío (sin posts ni recomendaciones)

**Síntoma:** con ciertas cuentas el home salía completamente vacío ("Sin resultados"), aunque la base de datos tuviera 139 recetas. En PC pasaba incluso sin seguir a nadie; en otras cuentas pasaba al seguir a gente que publica poco.

**Causa (dos problemas que se sumaban):**

1. **Las preferencias filtraban en duro.** El feed de recomendaciones hacía `categorias $in [preferencias]`. Si el usuario tenía un gusto que ninguna receta lleva (caso real: preferencia única `kosher`, y no hay ninguna receta con esa categoría), la consulta devolvía **0 resultados**. Mismo usuario, mismo catálogo: con las preferencias como filtro daba 0 recetas; usándolas solo para ordenar, 33.
2. **No había mezcla.** El feed solo enseñaba recomendaciones *si no seguías a nadie*. Si seguías a una o dos cuentas que no habían publicado (o publicaban poco), veías su feed vacío sin ningún relleno.

A esto se sumaba que la búsqueda y los filtros se aplicaban solo dentro de las cuentas seguidas, así que buscar sin seguir a nadie también daba vacío.

**Solución (móvil y PC, lógica compartida en un hook `useHomeFeed`):**
- Las **preferencias puntúan, no filtran**: las recomendaciones usan el orden `score` (que ya bonifica por gustos y por a quién sigues). Los **alérgenos sí filtran** en duro, porque eso es seguridad, no preferencia.
- El feed de seguidos y el de recomendaciones se **mezclan siempre** (cuando no hay búsqueda ni filtros): primero las recetas de quien sigues, luego un separador "Recetas para ti" y las recomendaciones como relleno. Así nunca queda vacío salvo que no haya recetas en la base de datos.
- La **búsqueda y los filtros pasan a buscar en todas las recetas**, no solo en las de cuentas seguidas.
- Retirada la barra lateral derecha de PC y centrado el contenido en una rejilla bento.

**Archivos:** `frontend/src/features/recetas/hooks/useHomeFeed.ts` (nuevo), `feedHome.tsx`, `feedHomePc.tsx`, `useRecetasFeed.ts`, `backend/src/controllers/recetasController.ts` (acepta `sort=score`).

---

## 3 bis. Normalización de categorías en la base de datos

**Problema:** los distintos scripts de seed sembraron la misma dieta con escrituras distintas, así que en la BBDD convivían `vegetariano` / `vegetariana` / `Vegetariana` y `mediterranea` / `mediterránea`. No rompe el home (las preferencias solo bonifican, no filtran), pero el *boost* por gustos no acierta: una receta etiquetada `Vegetariana` no recibe el empujón de un usuario con preferencia `vegetariano`, porque la comparación es exacta.

**Qué hace el script (`normalizarCategorias.ts`):**
- Recorre todas las recetas y todos los usuarios.
- Para cada categoría/preferencia la pasa por un normalizador: minúsculas + sin acentos, un mapa de alias para las variantes de género (`vegetariana` → `vegetariano`, `vegana` → `vegano`) y una comprobación contra la lista de ids canónicos de dieta. Si coincide, la sustituye por el id canónico; si no es una dieta (cocinas y tipos de plato como `italiana`, `desayuno`, `postres`), **la deja igual**.
- Tras mapear, elimina duplicados de cada lista (una receta con `vegetariano` y `Vegetariana` queda con `vegetariano` una sola vez).
- Solo escribe los documentos que cambian.

**Seguridad:** va en **dry-run por defecto** (enseña qué cambiaría sin tocar nada). Para aplicarlo de verdad hay que pasar `--apply`. En el dry-run sobre producción detectó 5 recetas a normalizar (3 con `mediterránea`, 2 con `vegetariana`/`Vegetariana`) y 0 usuarios.

**Comandos:**
- `npm run normalizar:categorias` → simulación, no escribe.
- `npm run normalizar:categorias -- --apply` → aplica los cambios.

**Archivos:** `backend/src/scripts/normalizarCategorias.ts` (nuevo), `backend/package.json` (script `normalizar:categorias`).

---

## 4. Permisos sin función en el perfil

**Causa:** la sección de Permisos (Localización, Cámara, Notificaciones) eran interruptores sin ninguna funcionalidad real conectada.

**Solución:** eliminada la sección entera. El componente de perfil es compartido, así que desaparece en móvil y en PC a la vez.

**Archivos:** `frontend/src/features/perfil/components/contenidoPerfil.tsx`.

---

## 5. Base de datos con pocas recetas

**Causa:** faltaba volumen de contenido para que la app se viera viva.

**Solución:** script de seed masivo aditivo e idempotente que añade 14 chefs y ~114 recetas reales, con foto de Pexels, reparto aleatorio de likes y relaciones de seguimiento. Los chefs usan avatares de iniciales (ui-avatars) sobre el color de marca. El script usa la búsqueda *food-scoped* de Pexels (`buscarFotoPexelsCascada`) para que las imágenes sean de comida.

**Scripts:** `backend/src/scripts/seedMasivo.ts`, `actualizarAvataresSeed.ts`, `limpiarDatosTest.ts`. Comandos: `npm run seed:masivo`, `npm run avatares:seed`, `npm run limpiar:test`.

---

## 6. Imágenes de recetas que no eran de comida

**Causa:** al sembrar imágenes buscando en Pexels por el título en español, algunos títulos con nombres de lugares o palabras ambiguas devolvían fotos sin relación (p. ej. "Bacalao al Pil Pil" → un bicho bola; "Arroz a la Cubana" → La Habana; "Tarta de Queso New York" → una guitarra).

**Solución:** auditadas las 137 recetas leyendo el texto `alt` que Pexels guarda de cada foto, detectadas 12 imágenes no-comida y corregidas con la búsqueda *food-scoped* (traduce el plato a términos en inglés: "cake", "lamb", "fried calamari"…). Verificación final: 0 imágenes sospechosas. El `seedMasivo` quedó usando esa misma búsqueda para que no se repita en futuros seeds.

---

## 7. Navegación rota en Discover (solo en escritorio)

**Causa:** la barra de navegación inferior está oculta en PC (`lg:hidden`); la navegación de escritorio la aporta `SidebarNavPc`, que home, perfil, colección y despensa incluyen, pero la página de Discover no. Resultado: en PC entrabas a Discover y te quedabas sin forma de volver.

**Solución:** añadido `SidebarNavPc` a la página de Discover (mismo patrón que el resto), con el contenido centrado.

**Archivos:** `frontend/src/app/(main)/discover/page.tsx`.

---

## 8. "Recordar contraseña" con cuentas de Google

**Causa:** el backend enviaba un correo de recuperación a cualquier cuenta existente, incluidas las de Google, que no tienen contraseña local. Confundía al usuario.

**Solución:** el backend ya no envía el correo a cuentas creadas con Google (proveedor `google` sin contraseña), manteniendo la respuesta genérica para no revelar si el correo existe. En la pantalla de recuperación se añadió un aviso indicando que si te registraste con Google debes entrar con el botón de Google.

**Archivos:** `backend/src/services/authService.ts`, `frontend/src/features/auth/components/formularioRecuperarContrasena.tsx`.

---

## 9. Nueva función del chat: "Receta con lo que tengo"

El chip dejó de mandar un texto genérico. Ahora busca en la base de datos una receta que contenga todos los ingredientes de la despensa respetando alérgenos y gustos, y si no hay coincidencia completa hace un prompt a Gemini con esos datos. Documentado en detalle en `docs/historico/desarrollo/chat-receta-despensa.md`.

---

## 10. Login con Google daba 500 en producción

**Síntoma:** `FUNCTION_INVOCATION_FAILED` en `/api/auth/callback/google`. Funcionaba en móvil pero no en el PC con una cuenta concreta (`@usal.es`), también en incógnito.

**Causa (la pista costó):** los logs de Vercel mostraban que la función crasheaba en menos de 1,5 s tras llamar al backend. Llamando en vivo al endpoint de Render se vio que esa cuenta tenía la **foto de perfil guardada como data-URI base64** (decenas de KB). Un cambio previo había metido esa foto en `token.picture`, y NextAuth la serializa en la **cookie de sesión** (límite ~4KB). La cookie se desbordaba y la función reventaba. Solo afectaba a cuentas con foto subida en base64; las demás (y el login por email, que ya descartaba los `data:` URIs) funcionaban.

**Solución:**
- En el callback `jwt` de Google y en el trigger `update`, nunca se guarda un `data:` URI en `token.picture`: solo URLs. Si la foto es base64, se usa la URL de Google o `null`.
- El avatar del perfil pasa a leerse del perfil del backend (`useMiPerfil`), que sí tiene la imagen completa, para que la foto subida se siga viendo aunque no viaje en la cookie.
- Endurecida la validación del backend para Google: una `foto` con formato raro o un `nombre` vacío ya no tumban el login (se descartan o se sustituyen por un valor por defecto), porque un campo no esencial no debe impedir autenticarse.

**Archivos:** `frontend/src/lib/auth.ts`, `frontend/src/features/perfil/components/contenidoPerfil.tsx`, `backend/src/lib/validadores.ts`.

---

## Notas de despliegue

- Frontend en Vercel y backend en Render se despliegan por separado; varios de estos arreglos tocan ambos lados y necesitaron redeploy de cada uno.
- El backend en Render (plan gratuito) duerme tras un rato de inactividad y tarda ~50 s en despertar en la primera petición. No es un bug; es el comportamiento del tier gratuito.
