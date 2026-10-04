# Contrato de la API de Cookr

Sacado de `backend/src/routes/`, `backend/src/app.ts` y `backend/src/lib/validadores.ts` el 4 de
octubre de 2026. Es la tarea F10.3 del plan.

**Total: 40 endpoints.** 39 en los siete routers y `GET /api/health`, que vive en `app.ts`. El plan
hablaba de 37; la cifra buena es esta, contada sobre los routers montados.

`backend/tests/contrato.api.test.ts` recorre los routers de Express y falla si un endpoint no tiene
aquí su apartado, si aquí hay uno que ya no existe, si la línea de **Auth** no coincide con el
middleware real o si la cifra de arriba deja de cuadrar. Para que el test lo encuentre, cada endpoint
es un título de nivel 3 con la forma `MÉTODO /api/ruta`, con los parámetros escritos como en Express
(`:id`).

---

## Lo que vale para todos

**Base.** `NEXT_PUBLIC_API_URL` en el frontend; en local, `http://localhost:4000/api`.

**Auth.** Tres posibilidades, y son las que aparecen en cada apartado:

| Valor | Qué hace |
|---|---|
| `requerirAuth` | Exige `Authorization: Bearer <JWT del backend>`. Sin cabecera: 401 `Token de autenticación requerido`. Con un token malo o caducado: 401 `Token inválido o expirado` |
| `optionalAuth` | Si llega un token válido, rellena `req.usuario` y la respuesta se personaliza. Si no llega o es malo, sigue como visitante; nunca da 401 |
| pública | No mira la cabecera |

El token es el JWT propio del backend (7 días), no la cookie de NextAuth. Ver `CLAUDE.md`, «Doble
token», y `decisiones/0004-doble-token.md`.

**Cuerpo.** JSON. Hasta 100 KB en todos los routers salvo `/api/chat` y `/api/despensa`, que admiten
8 MB porque reciben imágenes en base64. Por encima del límite: 413.

**Errores.** Todos salen por `manejarError` con la misma forma, `{ "error": "mensaje" }`.

| Status | Cuándo | Cuerpo |
|---|---|---|
| 400 | El cuerpo no pasa `validarBody` | `{ "error": "Datos inválidos", "errores": [{ "campo", "mensaje" }] }` |
| 401 | Ruta con `requerirAuth` sin token válido | `{ "error": "Token de autenticación requerido" }` o `"Token inválido o expirado"` |
| 404 | La ruta no existe | `{ "error": "Ruta no encontrada" }` |
| 413 | Cuerpo por encima del límite | `{ "error": ... }`, el mensaje de `express.json` |
| 429 | Un limitador ha cortado | `{ "error": ... }`, el mensaje del limitador |
| 500 | Fallo no controlado | `{ "error": "Error interno del servidor" }`, sin el mensaje interno |

En cada apartado, **Errores** lista solo los propios del endpoint. El 400 de validación se da por
supuesto donde hay cuerpo, el 401 donde hay `requerirAuth` y el 429 donde hay limitador.

**Limitadores.** Dos familias, las dos con store en Redis (Upstash) si está configurado y en memoria
si no (`decisiones/0006-redis-con-respaldo-en-memoria.md`):

- Los de autenticación (`middlewares/rateLimitAuth.ts`) cuentan **por IP del cliente**
  (`lib/ipCliente.ts`), no por usuario.
- Los de IA (`middlewares/rateLimitIA.ts`) cuentan **por usuario**, en ventanas de 60 segundos. Cada
  ruta tiene su propio contador.

Aparte está el tope diario global de llamadas a Gemini (`GEMINI_MAX_LLAMADAS_DIA`, 1000 por defecto):
al alcanzarlo, las rutas que llaman a Gemini responden 503.

**Formas que se repiten.**

```
PostFeed       { id, autor: { id, nombre, username, avatarUrl },
                 receta: { titulo, descripcion, imagenUrl, fotoFuente?, fotoCredito?, tiempo,
                           dificultad, alergenos },
                 likes, comentarios, guardado, liked, sigueAlAutor, fechaPublicacion }

RecetaDetalle  PostFeed + { categorias, pasos: string[],
                 ingredientes: [{ nombre, cantidad: number, unidad }], alergenos,
                 macros: { calorias, proteinas, carbos, grasas }, similares: PostFeed[], porciones }

RecetaColeccion { id, titulo, imagenUrl, autor: { nombre, avatarUrl } }

Perfil         { nombre, correo, foto: string | null, alergias, preferencias, proveedor }

ItemDespensa   { _id, nombre, cantidad: number, unidad, emoji, fechaAnadido }

Sesion         { token, usuario: { id, nombre, correo, foto, rol }, perfilCompleto }
```

Sin token, `guardado`, `liked` y `sigueAlAutor` salen siempre `false`.

**Alérgenos.** En el feed, en el detalle y en los similares, a un usuario autenticado se le aplican
siempre los alérgenos de su perfil, mande lo que mande en el query
(`decisiones/0003-alergenos-como-suelo-en-el-backend.md`). Los ids válidos son los 14 de
`lib/ingredientes.ts`: `cereales`, `lacteos`, `huevo`, `pescado`, `cacahuetes`, `soja`,
`frutosSecos`, `crustaceos`, `moluscos`, `apio`, `mostaza`, `sesamo`, `altramuz`, `sulfitos`.

---

## Autenticación · `/api/auth`

### POST /api/auth/registro

- **Auth:** pública
- **Limitador:** `limiteRegistro`, 5 por hora e IP
- **Cuerpo:** `esquemaRegistro`. `nombre` (2 a 50 caracteres), `correo` (correo válido, se guarda en
  minúsculas), `contrasena` (mínimo 8, con al menos una letra y un número)
- **Respuesta:** 201 `{ mensaje }`. Crea la cuenta sin verificar y manda el correo de verificación sin
  esperar a que salga: si Mailjet falla, el 201 llega igual
- **Errores:** 409 `Este correo ya está registrado`

### POST /api/auth/login

- **Auth:** pública
- **Limitador:** `limiteLogin`, 10 intentos fallidos cada 15 minutos por IP. Los aciertos no cuentan
- **Cuerpo:** `esquemaLogin`. `correo`, `contrasena` (no vacía)
- **Respuesta:** 200 `Sesion`
- **Errores:** 401 `Credenciales incorrectas` (correo que no existe o contraseña mala, sin distinguir);
  403 `Debes verificar tu correo antes de iniciar sesión`

### POST /api/auth/verificar-email

- **Auth:** pública
- **Limitador:** `limiteVerificacionEmail`, 20 por hora e IP
- **Cuerpo:** `esquemaVerificarEmail`. `token` (no vacío)
- **Respuesta:** 200 `{ mensaje }`
- **Errores:** 400 `Token de verificación inválido o expirado`; 400 `El enlace de verificación ha
  expirado`

### POST /api/auth/verificar-email/reenviar

- **Auth:** pública
- **Limitador:** `limiteReenvioVerificacion`, 5 por hora e IP
- **Cuerpo:** `esquemaReenviarVerificacion`. `correo`
- **Respuesta:** 200 `{ mensaje }`, el mismo exista o no la cuenta, para no revelar qué correos están
  registrados
- **Errores:** ninguno propio

### POST /api/auth/recuperar-contrasena

- **Auth:** pública
- **Limitador:** `limiteRecuperacion`, 5 por hora e IP
- **Cuerpo:** `esquemaRecuperar`. `correo`
- **Respuesta:** 200 `{ mensaje }`, el mismo exista o no la cuenta
- **Errores:** ninguno propio

### POST /api/auth/nueva-contrasena

- **Auth:** pública
- **Limitador:** `limiteNuevaContrasena`, 20 por hora e IP
- **Cuerpo:** `esquemaNuevaContrasena`. `token` (no vacío), `contrasena` (mínimo 8, con al menos una
  letra y un número)
- **Respuesta:** 200 `{ mensaje }`
- **Errores:** 400 `Token de recuperación inválido o expirado`; 400 `El enlace de recuperación ha
  expirado`

### POST /api/auth/google

- **Auth:** pública
- **Limitador:** `limiteGoogle`, 10 intentos fallidos cada 15 minutos por IP
- **Cuerpo:** `esquemaGoogleOAuth`. `idToken`, el `id_token` que Google le da a NextAuth
- **Respuesta:** 200 `Sesion`. Crea el usuario si no existe, ya verificado
- **Errores:** 401 `No se ha podido verificar el token de Google`; 401 `La cuenta de Google no tiene
  el correo verificado`; 503 `El inicio de sesión con Google no está disponible` (falta
  `GOOGLE_CLIENT_ID`)

Lo llama el servidor de Next, no el navegador: tiene que llevar las cabeceras de
`cabecerasIpCliente()` o todos los usuarios compartirían cupo. Lo mismo vale para el login.

### POST /api/auth/completar-perfil

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaCompletarPerfil`. `alergias` (array de ids de alérgeno, por defecto `[]`),
  `preferencias` (array de textos, por defecto `[]`)
- **Respuesta:** 200 `{ mensaje }`. Marca `perfilCompleto`
- **Errores:** 400 `"<valor>" no es un alérgeno del catálogo`; 404 `Usuario no encontrado`

---

## Recetas · `/api/recetas`

### GET /api/recetas

- **Auth:** `optionalAuth`
- **Limitador:** ninguno
- **Query:** `q`; `dietas`, `dificultad` y `alergenos` (listas separadas por comas); `categoria`;
  `pagina` (desde 1); `limite` (20 por defecto, 50 como máximo); `sort` (`reciente`, `likes` o
  `score`); `excluirPropio`, `soloSiguiendo` y `soloEvento` (`true` para activarlos). `excluirPropio`
  y `soloSiguiendo` solo hacen algo con sesión
- **Respuesta:** 200 `{ recetas: PostFeed[], total }`
- **Errores:** ninguno propio

Los alérgenos efectivos son la unión de los del perfil y los del query.

### GET /api/recetas/guardadas

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `RecetaColeccion[]`
- **Errores:** ninguno propio

### GET /api/recetas/mis-recetas

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `RecetaColeccion[]`, de la más reciente a la más antigua
- **Errores:** ninguno propio

### GET /api/recetas/foto-preview

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Query:** `query`, el texto con el que se busca en Pexels
- **Respuesta:** 200 `{ url, fotografo, urlFoto, urlPerfil }`, o `null` si no hay foto o no hay clave
  de Pexels
- **Errores:** 400 `El parámetro query es obligatorio`

### POST /api/recetas

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaCrearRecetaBody`. `titulo` (3 a 100), `descripcion` (10 a 300), `tiempo`
  (entero, mínimo 1), `unidadTiempo` (`min` o `h`), `porciones` (entero, mínimo 1), `dificultad`
  (`facil`, `media` o `dificil`), `dietas` (array; lo que no esté en el vocabulario se descarta),
  `alergenos` (array), `ingredientes` (al menos uno, cada uno con `nombre`, `cantidad` como texto y
  `unidad`), `pasos` (al menos uno, cada uno `{ texto }` de 10 caracteres o más), y opcionales
  `imagenUrl` (tiene que empezar por `https://`), `fotoFuente` (`usuario` o `pexels`) y `fotoCredito`
  (`{ fotografo, urlFoto, urlPerfil }` o `null`)
- **Respuesta:** 201 `{ id }`
- **Errores:** ninguno propio

Los `alergenos` que se guardan no son los que manda el cliente: son esos, filtrados a los 14
conocidos, más los que el backend detecta en los ingredientes. Sin `imagenUrl`, el backend busca una
foto en Pexels.

### POST /api/recetas/generar-desde-texto

- **Auth:** `requerirAuth`
- **Limitador:** `limitarPorUsuario(5)`, 5 por minuto y usuario
- **Cuerpo:** `esquemaGenerarDesdeTexto`. `descripcion` (10 a 1000 caracteres, sin contar los espacios
  de los extremos)
- **Respuesta:** 200 con la receta que devuelve Gemini, en JSON. El backend no tipa esa forma
  (`Promise<unknown>` en `chatService.ts`), así que este contrato tampoco la fija
- **Errores:** 503 `Gemini no está configurado`; 503 `No se pudo generar la receta. Verifica la
  configuración de Gemini.`; 503 al alcanzar el tope diario

### POST /api/recetas/macros-preview

- **Auth:** `requerirAuth`
- **Limitador:** `limitarPorUsuario(20)`, 20 por minuto y usuario. Va después de `validarBody`, así
  que un cuerpo inválido no gasta cupo
- **Cuerpo:** `esquemaMacrosPreview`. `ingredientes` (de 1 a 50, cada uno con `nombre` obligatorio y
  `cantidad` y `unidad` como texto, por defecto vacíos)
- **Respuesta:** 200 `{ calorias, proteinas, carbos, grasas }`. Todo a cero si Edamam y USDA no
  responden o no tienen clave
- **Errores:** ninguno propio

### GET /api/recetas/:id

- **Auth:** `optionalAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `RecetaDetalle`. Los `similares` ya vienen filtrados por los alérgenos del perfil
- **Errores:** 404 `Receta no encontrada`

Es público a propósito: `decisiones/0001-detalle-receta-publico.md`.

### GET /api/recetas/:id/comentarios

- **Auth:** `optionalAuth`
- **Limitador:** ninguno
- **Query:** `pagina` (desde 1), `limite` (8 por defecto, 20 como máximo)
- **Respuesta:** 200 `{ comentarios: [{ autorNombre, avatarUrl, texto, fecha }], total, hayMas }`.
  Con un id malformado devuelve la página vacía, no un 404
- **Errores:** ninguno propio

### GET /api/recetas/:id/similares

- **Auth:** `optionalAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `PostFeed[]`, filtrados por los alérgenos del perfil. Con un id malformado, `[]`
- **Errores:** ninguno propio

### POST /api/recetas/:id/like

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva. Es un interruptor: la segunda llamada quita el me gusta
- **Respuesta:** 200 `{ liked, totalLikes }`
- **Errores:** 404 `Receta no encontrada`

### POST /api/recetas/:id/guardar

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva. Es un interruptor
- **Respuesta:** 200 `{ guardado }`
- **Errores:** 404 `Receta no encontrada`; 404 `Usuario no encontrado`

### POST /api/recetas/:id/comentarios

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaComentario`. `texto` (de 1 a 500 caracteres tras recortar espacios)
- **Respuesta:** 201 `{ autorNombre, avatarUrl, texto, fecha }`
- **Errores:** 404 `Receta no encontrada`; 404 `Usuario no encontrado`

### PUT /api/recetas/:id

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaEditarRecetaBody`: los mismos campos que al crear, todos opcionales
- **Respuesta:** 204, sin cuerpo
- **Errores:** 403 `No tienes permiso para editar esta receta`; 404 `Receta no encontrada`

Si cambian los ingredientes o los alérgenos, estos se recalculan igual que al crear. Si cambia la
imagen y nadie más usa la anterior, se borra de Cloudinary.

### DELETE /api/recetas/:id

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 204, sin cuerpo
- **Errores:** 403 `No tienes permiso para eliminar esta receta`; 404 `Receta no encontrada`

---

## Usuarios · `/api/usuarios`

### GET /api/usuarios/destacados

- **Auth:** `optionalAuth`
- **Limitador:** ninguno
- **Query:** `limite` (5 por defecto, 10 como máximo)
- **Respuesta:** 200 `[{ id, nombre, foto, seguidores, siguiendo }]`, ordenados por número de
  seguidores. `seguidores` es un número. Con sesión, el propio usuario no sale en la lista
- **Errores:** ninguno propio

### GET /api/usuarios/me

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `Perfil`
- **Errores:** 404 `Usuario no encontrado`

### PUT /api/usuarios/me/contrasena

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaCambiarContrasena`. `contrasenaActual` (no vacía), `contrasenaNueva` (mínimo 8)
- **Respuesta:** 200 `{ mensaje }`
- **Errores:** 400 `La contraseña actual es incorrecta`; 400 `Este usuario no tiene contraseña propia`
  (cuenta de Google); 404 `Usuario no encontrado`

### PUT /api/usuarios/me/foto

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaFotoUsuario`. `fotoUrl`, que tiene que empezar por `https://`. Un `data:` URI se
  rechaza
- **Respuesta:** 200 `{ foto }`
- **Errores:** 404 `Usuario no encontrado`

### PUT /api/usuarios/me/preferencias

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaPreferencias`. `dietas` (array de textos) y `alergenos` (array de ids de
  alérgeno). Los dos obligatorios
- **Respuesta:** 200 `Perfil`, con los alérgenos en `alergias` y las dietas en `preferencias`
- **Errores:** 400 `"<valor>" no es un alérgeno del catálogo`; 404 `Usuario no encontrado`

### POST /api/usuarios/:id/seguir

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva. Es un interruptor: la segunda llamada deja de seguir
- **Respuesta:** 200 `{ siguiendo }`
- **Errores:** 400 `No puedes seguirte a ti mismo`; 404 `Usuario no encontrado` (el id no existe, está
  malformado o la cuenta del token se ha borrado)

---

## Despensa · `/api/despensa`

### GET /api/despensa

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `ItemDespensa[]`
- **Errores:** 404 `Usuario no encontrado`

### POST /api/despensa

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaAnadirDespensa`. Un item o un array de items. Cada uno: `nombre` (1 a 80),
  `cantidad` (número, 0 o más), `unidad` (1 a 20) y `emoji` (1 a 16), los cuatro obligatorios
- **Respuesta:** 201 `ItemDespensa[]`, la despensa entera tras añadir
- **Errores:** 404 `Usuario no encontrado`

### DELETE /api/despensa/vaciar

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 204, sin cuerpo
- **Errores:** 404 `Usuario no encontrado`

### POST /api/despensa/escanear-ticket

- **Auth:** `requerirAuth`
- **Limitador:** `limitarPorUsuario(5)`, 5 por minuto y usuario
- **Cuerpo:** `esquemaEscanearTicket`. `imagenBase64`, que empieza por `data:image/` y no pasa de
  7 000 000 caracteres (unos 5 MB)
- **Respuesta:** 200 `{ ingredientes: [{ nombre, cantidad, unidad }] }`. No guarda nada: el cliente
  los añade después con `POST /api/despensa`
- **Errores:** 503 `Gemini no está configurado`; 503 `No se pudo procesar el ticket`; 503 al alcanzar
  el tope diario

### PUT /api/despensa/:id

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaEditarDespensa`. `nombre`, `cantidad`, `unidad` y `emoji`, todos opcionales pero
  al menos uno (`Sin campos a actualizar`)
- **Respuesta:** 200 `ItemDespensa[]`, la despensa entera
- **Errores:** 404 `Item no encontrado`

### DELETE /api/despensa/:id

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `ItemDespensa[]`, la despensa entera
- **Errores:** 404 `Item no encontrado`

---

## Ingredientes · `/api/ingredientes`

### GET /api/ingredientes/buscar

- **Auth:** pública
- **Limitador:** ninguno
- **Query:** `q`. Con menos de 2 caracteres devuelve `[]` sin consultar nada
- **Respuesta:** 200 `string[]`, hasta 10 sugerencias de Open Food Facts. Si Open Food Facts falla o
  tarda más de 3 segundos, `[]`
- **Errores:** ninguno propio

Es el único endpoint que llama a un servicio externo sin sesión y sin limitador.

---

## Chat · `/api/chat`

### POST /api/chat

- **Auth:** `requerirAuth`
- **Limitador:** `limitarPorUsuario(30)`, 30 por minuto y usuario
- **Cuerpo:** `esquemaChat`. `mensajes` (de 1 a 50, cada uno `{ rol, texto }` con `rol` `user` o
  `model` y `texto` de hasta 2000 caracteres, no en blanco; el último tiene que ser del usuario) y,
  opcional, `imagenBase64` (empieza por `data:image/`, hasta 7 000 000 caracteres)
- **Respuesta:** 200 `{ respuesta }`. Una pregunta suelta, corta y sin imagen puede salir de la caché
  sin llamar a Gemini
- **Errores:** 429 si Gemini devuelve un error de cuota; 503 `El asistente no está disponible en este
  momento`; 503 `El asistente ha alcanzado el límite diario de uso. Inténtalo de nuevo mañana.`

### POST /api/chat/receta-despensa

- **Auth:** `requerirAuth`
- **Limitador:** `limitarPorUsuario(30)`, 30 por minuto y usuario
- **Cuerpo:** no lleva. Trabaja con la despensa y el perfil que ya hay guardados
- **Respuesta:** 200 `{ respuesta, fuente, receta? }`. `fuente` es `bbdd` (encontró una receta de
  Cookr; entonces viene `receta: { id, titulo, imagenUrl }`), `gemini` (la inventó) o `sin-despensa`
  (la despensa está vacía y no se llama a nadie)
- **Errores:** 429 si Gemini devuelve un error de cuota; 503 `El asistente no está disponible en este
  momento`; 503 al alcanzar el tope diario

---

## Subidas · `/api/subidas`

### POST /api/subidas/firma

- **Auth:** `requerirAuth`
- **Limitador:** ninguno
- **Cuerpo:** `esquemaFirmaSubida`. `tipo`: `receta` o `avatar`
- **Respuesta:** 200 `{ url, campos }`. El navegador hace un `POST` a `url` (Cloudinary) con `campos`
  y el fichero, y manda a la API solo la URL que le devuelven
  (`decisiones/0007-imagenes-en-cloudinary.md`)
- **Errores:** 503 `El almacenamiento de imágenes no está configurado` (falta `CLOUDINARY_URL`)

---

## Estado

### GET /api/health

- **Auth:** pública
- **Limitador:** ninguno
- **Cuerpo:** no lleva
- **Respuesta:** 200 `{ estado: "ok", entorno }`. Lo usa `scripts/keep-alive.sh`
- **Errores:** ninguno propio
