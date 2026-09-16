# Revisión en producción · correcciones del 17 de septiembre

Registro de lo que salió de la revisión completa de producción del 16/09/2026, hecha con Playwright
y la cuenta de pruebas del seed justo después de desplegar F6 y F7. Salieron cuatro fallos y cuatro
detalles menores, y al volver a probar aparecieron tres más. Están todos arreglados salvo un aviso de
consola que se deja a sabiendas (al final).

Queda una tarea contra producción que **no he ejecutado**: recalcular los alérgenos de las recetas
que ya están en Atlas. Los pasos están en `../../REVISION_DESPLIEGUE.md`, parte 1.

---

## [REV-001] Recetas con alérgenos sin detectar

Fecha: 2026-09-17 | Estado: ✅ Completado, falta aplicarlo en Atlas | Afecta: BE + FE | Grave

### Qué estaba mal

«Tortellini al Pesto Genovese Clásico» (`6a3b171979a80ae6b1f988ed`) lleva Parmigiano, Pecorino y
tortellini frescos, y solo estaba etiquetada con `frutosSecos`. Un usuario alérgico a los lácteos la
veía en el feed. El suelo de alérgenos del backend hacía bien su trabajo: filtraba por la etiqueta, y
la etiqueta estaba mal.

Dos causas que se suman. La primera, `detectarAlergenos` del frontend (`config/ingredientes.ts`) solo
reconocía un ingrediente si el nombre coincidía exacto con una entrada del catálogo o con un alias:
«Tortellini frescos» no casaba con «Tortellini fresco» y «Queso Parmigiano Reggiano rallado» no casaba
con nada. La segunda, el backend guardaba los `alergenos` que mandaba el cliente sin mirarlos, así que
bastaba un fallo del detector o una petición hecha a mano para publicar una receta mal etiquetada.

### Qué se hizo

**Un detector que tolera cómo escribe la gente.** Normaliza el nombre (sin tildes, en minúsculas, sin
palabras vacías como «de» o «con») y lo compara palabra a palabra con cada variante del catálogo,
aceptando plurales (`nuez` y `nueces`) y diferencias cortas al final de palabras largas. Las variantes
más largas van primero. Las palabras que ninguna variante cubre pasan por una lista de palabras clave
(`queso`, `parmesano`, `harina`, `gamba`...).

El orden es lo que evita los falsos positivos gordos: «Leche de coco» la cubre su propia entrada del
catálogo, que no tiene alérgenos, y por eso `leche` ya no llega a la lista de palabras clave.

| Ingrediente | Detecta |
|---|---|
| Tortellini frescos | cereales, huevo, lacteos |
| Queso Parmigiano Reggiano rallado | lacteos |
| Espaguetis integrales | cereales |
| Salsa de soja | soja, cereales |
| Mantequilla de cacahuete | cacahuetes |
| Leche de coco | nada |
| Pan sin gluten | cereales (falso positivo) |
| Pasta de curry | cereales (falso positivo) |

**El backend recalcula siempre.** `backend/src/lib/ingredientes.ts` es copia del catálogo y del
detector del frontend. `recetasService.crear` y `recetasService.actualizar` guardan
`alergenosDeReceta(ingredientes, declarados)`: lo que declara el autor, filtrado a los 14 alérgenos
conocidos, más lo que detectan los ingredientes. Al editar, si solo llegan los ingredientes o solo los
alérgenos, la otra mitad se lee de la receta guardada con `recetaRepository.obtenerIngredientesYAlergenos`.

**Un script para lo que ya está guardado.** `npm run recalcular:alergenos` recorre todas las recetas y
lista las que tienen menos alérgenos de los que llevan sus ingredientes. Por defecto no escribe. Con
`-- --apply` guarda antes una copia de los alérgenos de todas las recetas en
`backend/respaldos/alergenos-<fecha>.json` (en el `.gitignore`), la relee para comprobar que está
entera, añade lo que falta con `$addToSet` y vuelve a pasar para confirmar que no queda nada.
`-- --restaurar <fichero>` deja cada receta de la copia como estaba.

### Decisiones que costaron

**Copiar el catálogo en vez de compartirlo.** Frontend y backend no comparten código: no hay paquete
común ni workspace, y montarlo por un fichero era desproporcionado. La copia la vigila
`tests/alergenos.deteccion.test.ts`, que transpila el fichero del frontend y falla si el catálogo o lo
que detecta cada lado dejan de coincidir. Quien toque un `ingredientes.ts` y no el otro se encuentra el
CI en rojo.

**Solo sumar, nunca quitar.** El autor no puede quitar un alérgeno que llevan sus ingredientes, y el
script no borra ninguno de los que ya hay. El precio son los falsos positivos de la tabla. Una receta
de más escondida a un alérgico es una molestia; una de menos es lo que había, y es un problema de
salud. Es la misma lógica del suelo del perfil.

**Los alérgenos fuera de la lista no se tocan.** Si una receta guarda `Lacteos` con mayúscula, el
script avisa bajo un `⚠️` y la deja: añade `lacteos` si los ingredientes lo piden, pero no borra el
otro. Al crear y editar, en cambio, `alergenosDeReceta` descarta lo que no está entre los 14: las
recetas nuevas ya no pueden guardar una cadena rara. El perfil sí, y eso es M2 (F8.2), que va aparte.

### Qué queda a medias

- Ejecutarlo en Atlas. Hasta que no se pase el `--apply`, las recetas antiguas siguen con la etiqueta
  de antes y el Tortellini sigue saliendo a quien es alérgico a los lácteos.
- El detector sigue yendo por nombre. Un ingrediente que no está en el catálogo y no tiene ninguna
  palabra clave no marca nada, y ahí la única protección es lo que marque el autor.
- F8.2 sigue abierta: `alergias` del perfil acepta cualquier texto. El test de la copia cubre la mitad
  de su condición de terminado (catálogo del backend igual al del frontend), no el 400.

### Tests

`tests/alergenos.deteccion.test.ts`: el detector con nombres reales, la unión con los declarados y la
copia frente al frontend. Los seis primeros de `tests/recetas.escritura.test.ts` van por HTTP: crear
con la lista vacía, editar solo ingredientes o solo alérgenos, y que la receta recién creada no salga
en el feed de un alérgico a los lácteos.

---

## [REV-002] La hoja de comentarios no pasaba de la primera página

Fecha: 2026-09-17 | Estado: ✅ Completado | Afecta: FE | Entró con F7.5

### Qué estaba mal

En `/recetas/6a0ac90ca77fabe17a12550b`, «Ver los 9 comentarios» enseñaba 8, y al bajar no se pedía
`pagina=2` ni aparecía «Has visto todos los comentarios».

`comentariosReceta.tsx` vigilaba el centinela del scroll con un `useRef` leído dentro de un
`useEffect`. El efecto corre cuando `sheetAbierto` pasa a `true`, pero el contenido del *sheet* lo
monta un portal de Radix un render más tarde. En ese momento `sentinelRef.current` es `null`, el
efecto sale sin observar nada y ninguna de sus dependencias vuelve a cambiar.

### Qué se hizo

El centinela pasa a ser estado: `useState<HTMLLIElement | null>(null)` y `ref={setSentinel}`. Cuando
el portal monta el nodo, React llama a la ref, el estado cambia y el efecto se ejecuta otra vez con el
nodo ya en el DOM. De paso, el centinela y el mensaje final eran `div` y `p` dentro de un `ul`; ahora
son `li`.

---

## [REV-003] La vista previa de Pexels daba siempre 401

Fecha: 2026-09-17 | Estado: ✅ Completado | Afecta: FE | Ya existía

### Qué estaba mal

`recetasService.obtenerFotoPreview` llamaba a `GET /api/recetas/foto-preview` sin cabecera
`Authorization`, y la ruta exige sesión. Al crear una receta sin foto, la vista previa no enseñaba
ninguna imagen de Pexels. Y la pedía también cuando el autor ya había subido la suya.

### Qué se hizo

`useFotoPexelsPreview(titulo, necesitaFoto)` saca el token de `useSession()` y se lo pasa al servicio.
La consulta solo se lanza con token, con título y cuando `previsualizacionReceta.tsx` no tiene foto
propia. Es la trampa de siempre de `CLAUDE.md`: `apiClient` no tiene interceptor.

---

## [REV-004] El contador de comentarios de la cabecera no se movía

Fecha: 2026-09-17 | Estado: ✅ Completado | Afecta: FE | Entró con F7.5

### Qué estaba mal

`cabeceraReceta.tsx` pintaba `receta.comentarios`, el número que llega del servidor al cargar la
página. `useAgregarComentario` invalida la consulta de los comentarios, no la de la receta, así que
tras comentar el icono seguía marcando 0 hasta recargar.

### Qué se hizo

La cabecera lee el `total` de la primera página de `useComentarios(receta.id)`, la misma consulta que
alimenta la lista, y usa `receta.comentarios` mientras carga. TanStack Query la comparte con la lista,
así que no hay petición de más.

---

## [REV-005] Las fotos de recetas borradas se quedaban en Cloudinary

Fecha: 2026-09-17 | Estado: ✅ Completado | Afecta: BE | Ya existía desde F7.4

### Qué estaba mal

Borrar una receta o cambiarle la foto dejaba el fichero anterior en `cookr/recetas/`. Nada borraba en
Cloudinary: la foto de la receta de prueba de la revisión se quedó allí después de borrarla.

### Qué se hizo

- `lib/cloudinary.ts`. `publicIdDeImagenDeReceta(url)` saca el `public_id` solo de URLs de nuestra nube
  y de la carpeta `cookr/recetas/`. Cualquier otra (Pexels, un avatar, otra nube) da `null` y no se toca.
  `eliminarImagen(url)` llama al `destroy` firmado con `invalidate`, para que la CDN deje de servirla.
- `recetaRepository.eliminar` devuelve la `imagenUrl` que tenía la receta, y `actualizar` devuelve la
  anterior si ha cambiado.
- `recetasService.borrarImagenSiNadieLaUsa` cuenta, después de escribir, cuántas recetas siguen usando
  esa URL, y solo borra si no queda ninguna.

### Decisiones que costaron

**Borrar después de escribir y sin tumbar la petición.** Si Cloudinary no responde, la receta se borra
igual y el error va al log como `[Cloudinary] No se pudo borrar la imagen`. Un fichero huérfano cuesta
céntimos; una receta que no se deja borrar porque un tercero está caído, no.

**Contar antes de borrar.** Hoy cada subida lleva su propio `public_id`, pero nada impide que dos
recetas acaben con la misma URL (un seed, una copia a mano en Atlas). Borrar sin mirar le quitaría la
foto a la otra.

**Solo `cookr/recetas/`.** El avatar tiene `public_id` fijo por usuario (PERF-004) y cada subida pisa
la anterior. Como mucho queda uno sin usar si alguien vuelve a una foto de fuera de Cloudinary, y se
reutiliza en cuanto sube otra.

### Qué queda a medias

El arreglo actúa a partir de ahora. Las dos imágenes que dejó la revisión (la foto de la receta de
prueba y el avatar) y las huérfanas que hubiera antes se quitan a mano desde la Media Library.

Sin `CLOUDINARY_URL` no se borra nada y no sale ningún error. En Render está puesta desde F7.4.

### Tests

`tests/cloudinary.test.ts` saca el `public_id` y comprueba la llamada firmada con axios mockeado.
Los seis de limpieza de `tests/recetas.escritura.test.ts` cubren borrar, cambiar de foto, editar sin
cambiarla, la URL compartida, el fallo de Cloudinary y el intento de borrar la receta de otro.

---

## [REV-006] Detalles menores

Fecha: 2026-09-17 | Estado: ✅ Completado | Afecta: BE + FE

Los cuatro primeros salieron en la revisión. Los otros tres, al volver a probar en local.

| Qué pasaba | Dónde | Arreglo |
|---|---|---|
| Las categorías salían con el id en mayúsculas: `ALTOENPROTEINAS` en vez de «Alto en proteínas» | `cabeceraReceta.tsx` | `nombreCategoria(id)` busca la etiqueta en `DIETAS_OPCIONES` |
| Radix avisaba en consola de diálogos sin descripción | diez ficheros con *dialogs*, *sheets* y un *drawer* | `DialogDescription`, `SheetDescription` o `DrawerDescription` en todos. Donde ya había un subtítulo visible, el subtítulo pasa a ser la descripción; donde no, va `sr-only` |
| `/editar-receta` estaba fuera del `matcher` | `middleware.ts` | Añadida. Sin sesión lleva al login con `callbackUrl`. Es la mitad de M5: `/completar-perfil` sigue fuera |
| Las huérfanas de Cloudinary | | REV-005 |
| `PUT /api/usuarios/me/foto` aceptaba un `data:` URI | `usuarios.routes.ts`, `usuariosController.ts` | `esquemaFotoUsuario` existía desde F7.4, pero la ruta no lo usaba y el controlador solo comprobaba que fuera texto. Ahora va `validarBody(esquemaFotoUsuario)` y el controlador ya no valida |
| Con tiempo o porciones vacíos, el formulario decía «Invalid input: expected number, received NaN» | `crearReceta.schema.ts` | zod 4 rechaza `NaN` antes de llegar al `.min()`, con su mensaje en inglés. `z.number({ error: '...' })` le da uno en español |
| Una receta con `imagenUrl` vacía rompía `next/image` con «Image is missing required src» | `heroReceta`, `carruselSimilares`, `sidebarTendencias`, `tarjetaPost`, `tarjetaPostPc`, `tarjetaDiscover` | `imagenUrl \|\| '/images/recetas/crearRecetaImagen.webp'`. Con `\|\|` y no `??`, que la cadena vacía también cuenta |

---

## Lo que se vio y no se tocó

**Aviso de `forwardRef` en desarrollo.** Con `npm run dev`, al abrir cualquier diálogo, *sheet* o
*drawer* sale `Function components cannot be given refs` en `DialogOverlay`, `SheetOverlay` o
`DrawerOverlay`. Los componentes de `components/ui/` son de shadcn v4, escritos para React 19, donde
`ref` es una prop más; Cookr va con React 18, que necesita `forwardRef`. Ya estaba antes, solo sale en
desarrollo y no rompe nada visible: el overlay se pinta y se cierra bien. Quitarlo es reescribir
`components/ui/` con `forwardRef` o subir a React 19, y ninguna de las dos cosas es una corrección.

**La contraseña de la cuenta de pruebas del seed está publicada en el repositorio** y sigue entrando
en producción. Cambiarla o borrar la cuenta es cosa de Atlas, no de código.

---

## Cómo se probó

- Backend: 215 tests en verde (eran 169), `npm run lint`, `tsc` de los tests y `npm run build`.
- Frontend: `tsc --noEmit` y `next lint` limpios, con los tres avisos de `<img>` de siempre.
- En local, backend sobre un `mongodb-memory-server` sembrado con una receta de 25 comentarios y
  `next dev` delante, recorrido con Playwright. «Espaguetis integrales» marca cereales en el formulario
  y en Mongo, y al editar a «Queso parmesano rallado» pasa a lácteos. La hoja pide las páginas 2, 3 y 4
  y termina en «Has visto todos». `foto-preview` da 200. El contador pasa a 26 al comentar.
  `/editar-receta` sin sesión da 307 al login. Todos los diálogos tocados abren sin aviso de Radix.
- `recalcular:alergenos` contra otro Mongo en memoria: la pasada en seco no escribe, `--apply` corrige
  y deja copia, una segunda pasada encuentra 0 y `--restaurar` devuelve los datos a como estaban.

Contra Atlas no se ha ejecutado nada.

## Ficheros tocados

Backend: `lib/ingredientes.ts` (nuevo), `lib/cloudinary.ts`, `repositories/recetaRepository.ts`,
`services/recetasService.ts`, `routes/usuarios.routes.ts`, `controllers/usuariosController.ts`,
`scripts/recalcularAlergenos.ts` (nuevo), `package.json`, `.gitignore`. Tests nuevos:
`alergenos.deteccion`, `recetas.escritura` y `cloudinary`, y dos casos más en `imagenes`.

Frontend: `config/ingredientes.ts`, `middleware.ts`, `services/recetasService.ts`,
`hooks/useFotoPexelsPreview.ts`, `types/crearReceta.schema.ts`, los componentes del detalle
(`cabeceraReceta`, `comentariosReceta`, `heroReceta`, `carruselSimilares`), las tarjetas del feed y de
discover, y los diálogos de chat, colección, despensa, perfil, filtros y crear receta.
