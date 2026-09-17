# Revisión de interfaz · 17 de septiembre de 2026

Recorrido completo de la interfaz desplegada en móvil (390×844), tablet (768×1024) y escritorio
(1440×900), con sesión iniciada. Mediciones reales con Playwright y auditoría de accesibilidad con
axe-core 4.10.2 en las ocho rutas.

No es un rediseño. Cookr se ve bien y la identidad visual funciona: la paleta cálida, la tipografía
y el detalle de los títulos en cursiva con el subrayado dibujado tienen personalidad y se reconocen
entre pantallas. Lo que falla es otra cosa, y es más aburrida de arreglar: **la versión de escritorio
es la versión móvil metida en una columna estrecha**, y eso arrastra huecos, inconsistencias de
comportamiento y algún fallo funcional.

Cada hallazgo lleva `UI-XXX`, fichero y línea. Al final hay un orden de ataque.

---

## Resumen: lo que hay que arreglar sí o sí

| # | Qué | Dónde | Coste | Estado |
|---|---|---|---|---|
| UI-001 | El bento del feed de escritorio deja un hueco cada 7 tarjetas | `feedHomePc.tsx` | 1 h | ✅ 18/09 |
| UI-002 | La tarjeta destacada estira y deja una franja muerta | `tarjetaPostPc.tsx:119` | 30 min | ✅ 18/09 |
| UI-003 | **Like y guardar en escritorio no llaman al backend** | `tarjetaPostPc.tsx:26-31` | 1 h | ✅ 18/09 |
| UI-004 | Cuatro pantallas de escritorio limitadas a 512–768 px en 1440 | 4 `page.tsx` | 3 h | ✅ 18/09 |
| UI-005 | Cada pantalla monta su árbol dos veces | 5 `page.tsx` | 4 h | abierto |
| UI-006 | Contraste de marca por debajo de AA (4,14:1) | `globals.css` | 2 h | abierto |
| UI-007 | Dos `<select>` sin nombre accesible | formulario de crear receta | 20 min | ✅ 18/09 |
| UI-008 | El botón de filtros de Discover no tiene nombre | `contenidoDiscover.tsx` | 10 min | ✅ 18/09 |
| UI-009 | `<main>` anidado en todas las rutas | `(main)/layout.tsx` + páginas | 30 min | abierto |
| UI-010 | El FAB tapa un campo del formulario | `navBarInferior.tsx:47` | 20 min | ✅ 18/09 |
| UI-011 | No hay tablet: de 767 a 1023 se ve el móvil estirado | `page.tsx` × 5 | 3 h | abierto |
| UI-012 | `ContenidoDiscover` nunca pasa `categoria` al hook | `contenidoDiscover.tsx` | 15 min | abierto |

---

## Ola 1, cerrada el 18 de septiembre de 2026

Se atacaron los fallos funcionales y de accesibilidad, no la estética: UI-001, UI-002, UI-003, UI-004,
UI-007, UI-008 y UI-010, más UI-016 (el evento inventado de Discover, que estaba en la sección 4).
Quedan abiertos UI-005, UI-006, UI-009, UI-011 y UI-012.

Dos cosas salieron distintas de lo que prescribía este documento, y conviene saber por qué:

**El botón de comentarios de escritorio no lleva ancla.** UI-003 pedía enlazar a
`/recetas/{id}#comentarios`. Ese ancla no existe, y no puede existir todavía: `detalleRecetaCliente.tsx`
monta `ComentariosReceta` **dos veces** (líneas 52 y 82), una por árbol, que es exactamente UI-005. Poner
el `id` ahora crearía dos elementos con el mismo identificador y el navegador saltaría al que está
oculto. El enlace va a `/recetas/{id}` a secas hasta que UI-005 deje un solo árbol.

**Quitar el `row-span-2` no bastaba para UI-002.** El documento decía que la franja muerta desaparecía
sola. No: al quitarlo, el `hero` (≈664 px) y la `small` que comparte fila (≈352 px) siguen en la misma
fila de rejilla, y con `align-items: stretch` el hueco no se elimina, **se muda a la tarjeta pequeña**.
El arreglo fue dar a la imagen de las dos variantes `flex-1` con un suelo `min-h-*`, de modo que sea la
imagen la que absorbe el sobrante de la fila. El `row-span-2` sí se quitó y el ciclo suma nueve, como
pedía UI-001, y no se usó `grid-auto-flow: dense`.

---

## 1 · El espacio desperdiciado en escritorio

Esto es lo que se ve a simple vista y lo que motivó la revisión. Hay tres causas distintas y conviene
no confundirlas, porque se arreglan por separado.

### UI-001 · El patrón bento deja un hueco cada siete tarjetas ✅

`features/recetas/components/home/feedHomePc.tsx:14-22`

```ts
const VARIANTES: VarianteTarjeta[] = [
  'hero', 'small', 'small', 'small', 'wide', 'small', 'small',
]
```

La rejilla es `grid-cols-3`. `hero` ocupa `col-span-2 row-span-2` (cuatro celdas), `wide` ocupa
`col-span-2` (dos), y las cinco `small` una cada una: **once celdas para un ciclo de siete tarjetas**.
Once no es múltiplo de tres. Al empezar el siguiente ciclo, el `hero` necesita un bloque de 2×2 que no
cabe en la celda suelta que queda, así que el navegador lo baja una fila entera y **la celda que sobra
se queda vacía**. Con 20 recetas en el feed salen dos agujeros.

Es un fallo de aritmética, no de diseño. Dos arreglos posibles:

**El barato**, si se quiere conservar el patrón: añadir `grid-auto-flow: dense` a la rejilla. El
navegador rellena los huecos con la siguiente tarjeta que quepa. El precio es que el orden visual deja
de coincidir con el orden del DOM, y eso **rompe el orden de lectura para un lector de pantalla y para
la navegación con teclado**. Con contenido ordenado por relevancia, como es el feed, no compensa.

**El correcto**: que el ciclo sume múltiplo de tres. Quitar el `row-span-2` del `hero` lo deja en dos
celdas y el ciclo pasa a nueve, que sí tila:

```
[HERO col-span-2      ][SMALL]
[SMALL][WIDE col-span-2      ]
[SMALL][SMALL][SMALL]
```

Tres filas exactas, sin huecos, y el destacado sigue destacando. Es además el que arregla UI-002 de
paso.

**Hecho el 18/09/2026.** Se aplicó el correcto. El ciclo quedó
`['hero', 'small', 'small', 'wide', 'small', 'small', 'small']`, nueve celdas, y el `hero` perdió el
`row-span-2`. Si alguien toca ese array, la regla que no puede romper es que la suma de celdas siga
siendo múltiplo de tres.

### UI-002 · La franja muerta de la tarjeta destacada ✅

`features/recetas/components/home/tarjetaPostPc.tsx:119`

```tsx
<div className="flex flex-grow flex-col justify-between p-6">
```

El `hero` ocupa dos filas de la rejilla, y esas dos filas las miden las dos tarjetas pequeñas de la
columna derecha, que son más altas entre las dos que el contenido del destacado. Con `flex-grow` y
`justify-between`, la diferencia se convierte en una franja vacía entre la descripción y la fila de
like/comentar/guardar. En 1440 medí **346,66 px de columna, 24 px de hueco** y una franja muerta de
más de 100 px.

Quitando el `row-span-2` (UI-001) el problema desaparece solo, porque el destacado ya no tiene que
estirarse para igualar dos tarjetas apiladas. Si se quiere mantener el formato alto, la alternativa es
fijar la altura de la imagen en `clamp()` y dejar que el texto crezca con `line-clamp-3` en vez de
`line-clamp-2`, aprovechando el espacio en vez de dejarlo en blanco.

**Hecho el 18/09/2026, pero no como decía aquí.** Quitar el `row-span-2` no elimina el hueco: lo
traslada a la tarjeta pequeña que comparte fila, porque la rejilla sigue igualando alturas con
`align-items: stretch`. Lo que lo resuelve es que el sobrante de la fila se lo coma la imagen y no el
texto: la imagen del `hero` pasó a `relative min-h-[16rem] flex-1` y la de la `small` a
`relative min-h-[12rem] flex-1`, y el bloque de texto del `hero` perdió el `flex-grow justify-between`.

### UI-004 · Cuatro pantallas limitadas a menos de la mitad del ancho ✅

Los anchos máximos de escritorio, medidos en un viewport de 1440 px con la barra lateral de 256 px:

| Ruta | Contenedor | Ancho útil | Aire muerto a cada lado |
|---|---|---|---|
| `/home` | `max-w-6xl` (1152 px) | 1152 | 16 px |
| `/discover` | `max-w-3xl` (768 px) | 768 | 208 px |
| `/coleccion` | `max-w-2xl` (672 px) | 672 | 256 px |
| `/despensa` | `max-w-2xl` (672 px) | 672 | 256 px |
| `/perfil` | `max-w-lg` (512 px) | 512 | 336 px |

`/home` está bien. Las otras cuatro pintan la columna de móvil en el centro de la pantalla.

Lo que hay que hacer en cada una:

**Despensa** es la más sangrante. Cada ingrediente es una fila de 672 px con el nombre a la izquierda,
la cantidad debajo y los iconos de editar y borrar a 500 px de distancia. Con 18 ingredientes hay que
hacer scroll y el ojo recorre medio metro de blanco por fila. Debería ser una rejilla de tarjetas
(`grid-cols-2` a 1024, `grid-cols-3` a 1280) con el nombre, la cantidad y las acciones juntos. Los 18
ingredientes caben en una pantalla sin scroll, que es justo lo que se quiere de una despensa: verla
entera de un vistazo.

**Colección** ya es una rejilla de dos columnas, pero encerrada en 672 px. Subir a
`lg:grid-cols-3 xl:grid-cols-4` dentro de `max-w-6xl` pasa de 4 recetas visibles a 12.

**Perfil** es una lista de cuatro enlaces en 512 px con media pantalla en blanco debajo. Es la
candidata natural a dos columnas: la tarjeta de identidad y las preferencias a la izquierda, los
alérgenos y las dietas a la derecha, y «Guardar cambios» fijo abajo. Los alérgenos del perfil son la
pieza que manda sobre todo el filtrado del feed y ahora están escondidos detrás de un enlace
(«Cambiar preferencias y alérgenos») que no enseña qué hay marcado. En escritorio hay sitio de sobra
para mostrarlos.

**Discover** a 768 px pinta las tarjetas trending a dos columnas con imágenes de 470 px de alto. Es de
las pocas que casi funciona, pero el banner de evento («Semana de la Cocina Mediterránea») ocupa
175 px de alto con dos líneas de texto y un hueco de 90 px entre el rótulo y el título, sin imagen que
lo justifique.

**Hecho el 18/09/2026.** Anchos nuevos y qué cambió por dentro:

| Ruta | Antes | Ahora | Rejilla interior |
|---|---|---|---|
| `/discover` | `max-w-3xl` | `max-w-6xl` | `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| `/coleccion` | `max-w-2xl` | `max-w-6xl` | `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| `/despensa` | `max-w-2xl` | `max-w-6xl` | de `flex-col` a `grid lg:grid-cols-2 xl:grid-cols-3` |
| `/perfil` | `max-w-lg` | `max-w-5xl` | dos columnas en `lg` |

Subir el contenedor no bastaba en ninguna de las cuatro: colección y despensa se habrían limitado a
estirar la columna de móvil, así que las clases responsive van dentro de los componentes compartidos
(`gridRecetasColeccion.tsx`, `listaIngredientes.tsx`, `contenidoDiscover.tsx`). Como el árbol móvil se
monta bajo un `lg:hidden`, esas clases `lg:` solo tienen efecto en el árbol de escritorio: cuando se
arregle UI-005 y quede un solo árbol, seguirán valiendo tal cual.

El perfil sí necesitó tocar estructura. Las dietas y los alérgenos salieron del diálogo a un componente
propio, `panelPreferencias.tsx`, que el diálogo sigue usando en móvil y que en escritorio se pinta
entero en la columna derecha, que es lo que pedía esta ficha: los alérgenos mandan sobre todo el
filtrado del feed y no pueden seguir escondidos detrás de un enlace. El «Guardar cambios» de abajo
**no** se dejó fijo en escritorio, se ocultó: no guardaba nada, era un `window.history.back()`. El botón
que guarda de verdad es el del panel.

### UI-011 · Entre 768 y 1023 px no hay diseño

El punto de corte es `lg` (1024 px). Todo lo que hay por debajo se lleva el árbol de móvil. En un iPad
en vertical (768 px) eso significa: el feed en una sola columna con fotos de 753 px de ancho por 565 de
alto, una receta por pantallazo, y la barra de navegación inferior de móvil cruzando 768 px con cinco
iconos diminutos separados por 150 px.

El arreglo no es un punto de corte nuevo, es aplicar los que ya hay: `md:grid-cols-2` en el feed,
colección y despensa, y bajar la barra lateral de `lg` a `md` para que la tablet en horizontal la
tenga. El feed móvil en `md` puede seguir siendo de una columna, pero con la imagen en `aspect-[16/10]`
en vez de `4/3` entran dos recetas por pantalla.

---

## 2 · Fallos de comportamiento

### UI-003 · En escritorio, el like y el guardar no persisten ✅

`features/recetas/components/home/tarjetaPostPc.tsx:26-31`

```ts
const toggleLike = () => {
  setLikes((prev) => (liked ? prev - 1 : prev + 1))
  setLiked((prev) => !prev)
}

const toggleGuardado = () => setGuardado((prev) => !prev)
```

No hay mutación. El corazón se rellena, el contador sube, la animación se dispara, y al recargar no ha
pasado nada. El botón de comentarios tampoco hace nada: no navega ni abre la hoja.

La tarjeta de móvil (`tarjetaPost.tsx`) lo tiene bien resuelto y además es honesta: likes y comentarios
son `<div>` informativos, solo el marcador es un `<button>` y llama a `useToggleGuardado` con retroceso
si falla. En escritorio son `<button>` con `aria-label="Dar like"`, así que un lector de pantalla
anuncia una acción que no ocurre.

Es el fallo más serio de la revisión porque afecta a la función principal de una red social. Arreglo:
importar `useToggleLike` y `useToggleGuardado` en `tarjetaPostPc.tsx` con el mismo patrón optimista, y
que el botón de comentarios enlace a `/recetas/{id}#comentarios`.

De paso hay que decidir si el like desde el feed existe o no, porque ahora **en móvil no se puede dar
like desde el feed y en escritorio parece que sí**. Recomiendo que exista en los dos: es el gesto más
barato de la interfaz y hoy obliga a entrar en el detalle.

**Hecho el 18/09/2026.** `tarjetaPostPc.tsx` ya llama a `useToggleLike` y `useToggleGuardado` con el
patrón optimista y retroceso de la tarjeta de móvil, y un `useEffect` resincroniza el estado local
cuando el post cambia de identidad al refetchear el feed. El botón de comentarios pasó a `<Link>` con
`aria-label`, **pero sin el ancla `#comentarios`**: ese `id` no existe y no puede existir mientras
`detalleRecetaCliente.tsx` monte `ComentariosReceta` dos veces (UI-005). El enlace lleva a
`/recetas/{id}` a secas; el ancla se añade cuando se cierre UI-005.

La decisión de fondo (si el like desde el feed existe en las dos plataformas) sigue sin tomar. Ahora
mismo funciona en escritorio y no está en móvil.

### UI-010 · El botón flotante de Cookr IA tapa contenido ✅

`components/common/navBarInferior.tsx:44-47`

```tsx
className="fixed left-1/2 z-50 -translate-x-1/2 lg:hidden"
style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 0.25rem)' }}
```

56 px de círculo centrados horizontalmente, a 76 px del borde inferior, con `z-50` y sin que ningún
contenido reserve ese espacio. El `<main>` reserva `pb-[calc(4.5rem+safe-area)]`, que es la altura de la
barra, no la del botón.

Consecuencias medidas: en `/crear-receta` el botón se planta encima del campo PORCIONES, en `/home`
tapa la esquina de la foto de la segunda receta, y en `/despensa` a 768 px cae sobre la fila de «Maíz».
Ya me pasó durante la revisión de producción: la barra interceptó un clic en «Ver los 9 comentarios» y
hubo que hacer scroll para esquivarla.

Tres arreglos, en orden de preferencia:

1. **Meter Cookr IA en la barra**, como sexto ítem o sustituyendo a uno. En escritorio ya es un ítem
   normal de la barra lateral (`sidebarNavPc.tsx:11`), así que el FAB es una inconsistencia entre
   plataformas, no una decisión.
2. Moverlo a la esquina inferior derecha, que es donde se espera un FAB y donde estorba menos.
3. Dejarlo donde está y subir el `padding-bottom` del `<main>` a 8,5 rem. Tapa menos, pero sigue
   flotando sobre el contenido al hacer scroll.

**Hecho el 18/09/2026 con la opción 1.** El FAB ya no existe. Cookr IA es el tercero de seis ítems de
la barra, entre Despensa y Discover, que es la misma posición que ocupa en la barra lateral de
escritorio. Con seis ítems en 390 px cada uno pasó a `min-w-0 flex-1` con la etiqueta en `truncate`, y
el contenedor de `px-2` a `px-1`. Es el cambio de diseño más visible de la ola.

`RUTAS_SIN_NAVBAR` sigue ocultando la barra en `/chat` aunque `/chat` esté ahora en la barra, y no es
una incoherencia: `contenidoChat.tsx:31` es un `fixed inset-0 z-[60]`, una capa a pantalla completa por
encima del `z-40` de la barra, así que la barra no se vería de todos modos y el chat tiene su propia
salida.

### UI-005 · Cada pantalla se monta dos veces

`app/(main)/discover/page.tsx`, `coleccion`, `despensa`, `perfil`, `home`

```tsx
<div className="lg:hidden">   <ContenidoDiscover /> </div>
<div className="hidden lg:flex"> ... <ContenidoDiscover /> ... </div>
```

Los dos árboles están en el DOM a la vez. `display:none` esconde uno, pero React lo monta igual: dos
veces los hooks, dos `IntersectionObserver` sobre el scroll infinito, dos suscripciones a TanStack
Query, dos juegos de estado local que divergen en cuanto se cruza el punto de corte redimensionando.

TanStack Query deduplica la petición, así que no es un problema de red. Es trabajo de render duplicado
y una fuente de errores raros: si alguien añade un `useEffect` con efecto secundario a uno de estos
componentes, se ejecuta dos veces.

El patrón correcto en Tailwind es un solo árbol con clases por punto de corte. Donde de verdad haga
falta cambiar de componente (la tarjeta del feed es un caso legítimo: móvil vertical, escritorio
bento), que la bifurcación sea lo más pequeña posible y esté al final del árbol, no al principio.

### UI-012 · Discover ignora el filtro de categoría

`features/discover/components/contenidoDiscover.tsx`

`useDiscover` acepta `categoria` y lo pasa al backend en minúsculas
(`features/discover/hooks/useDiscover.ts`), pero `ContenidoDiscover` llama al hook con
`{ q, tab, filtrosAvanzados }` y nunca con `categoria`. La lista `CATEGORIAS_DISCOVER` de
`features/discover/data/datosDiscover.ts` no la usa nadie. Quedó a medias.

Además, el filtro `categoria` del backend **distingue mayúsculas**: `?categoria=pasta` devuelve 8
recetas y `?categoria=Pasta` devuelve 0, porque `recetaRepository.findAll` mete el valor tal cual en un
`$all`. El hook de Discover lo baja a minúsculas antes de mandarlo, lo que tapa el problema para ese
camino y lo deja abierto para cualquier otro que llame a la API directamente. La normalización debería
estar en el repositorio, no en el cliente.

**Comprobado contra producción el 18/09/2026** con 37 peticiones a la API desplegada. El backend filtra
bien: la búsqueda ignora mayúsculas, las dificultades cuadran con lo que manda el drawer, el tope de
`limite` aguanta y los valores basura devuelven cero sin reventar. La tabla completa está en
[revision-produccion.md](../cambios/revision-produccion.md).

Lo que sí salió es un problema de datos que afecta a este mismo filtro: hay cuatro recetas en
producción etiquetadas con categorías que no existen en `DIETAS_OPCIONES` (`vegetariana`, `vegana`,
`sin lactosa`, `sin gluten (verificar ingredientes)`), creadas con «Crear desde descripción» porque el
prompt de Gemini no enumera las dietas válidas y el validador acepta cualquier cadena. Ninguna de esas
cuatro aparece al filtrar por dieta ni puntúa en el feed personalizado. Va como REV-009 en el registro
de producción, porque es backend y datos, no interfaz. Si se conectan las categorías de Discover sin
arreglar eso antes, el filtro nuevo nacerá mintiendo.

---

## 3 · Accesibilidad

axe-core sobre las ocho rutas, con sesión y en las dos anchuras. `/chat` sale limpia; el resto, no.

| Regla | Gravedad | Dónde | Nodos |
|---|---|---|---|
| `select-name` | crítica | `/crear-receta`, `/editar-receta` | 2 |
| `button-name` | crítica | `/discover` | 1 |
| `color-contrast` | seria | todas | 3 |
| `list` | seria | `/recetas/[id]` | 1 |
| `landmark-no-duplicate-main` | moderada | todas | 1 |
| `landmark-main-is-top-level` | moderada | todas | 1 |
| `region` | moderada | todas (móvil) | 1 |
| `page-has-heading-one` | moderada | `/home` | 1 |
| `heading-order` | moderada | `/coleccion`, `/recetas/[id]` | 1 |

### UI-007 · Dos `<select>` sin nombre accesible (crítica) ✅

`select[name="unidadTiempo"]` y `select[name="ingredientes.N.unidad"]`. Tienen etiqueta visual encima
(«TIEMPO», «INGREDIENTES») pero ninguna asociada: sin `<label for>`, sin `aria-label`, sin
`aria-labelledby`. Un lector de pantalla anuncia «cuadro combinado, min» y el usuario no sabe si está
eligiendo la unidad de tiempo, la de un ingrediente o cuál de los ocho ingredientes.

Arreglo: `aria-label="Unidad de tiempo"` y `aria-label={`Unidad del ingrediente ${i + 1}`}`. Veinte
minutos y cierra la violación crítica que más se repite.

**Hecho el 18/09/2026**, tal cual. Un detalle que ahorra trabajo: el `<select>` de la unidad del
ingrediente vive en `crearReceta/seccionIngredientes.tsx`, que `formularioEditarReceta.tsx` importa,
así que una sola edición cubre crear y editar. El de la unidad de tiempo sí está duplicado en los dos
formularios y hubo que tocarlo dos veces.

### UI-008 · El botón de filtros de Discover no tiene nombre (crítica) ✅

El botón de la derecha del buscador solo contiene un `<svg>` decorativo. Se anuncia como «botón», sin
más. `aria-label="Abrir filtros"`.

Vale la pena repasar todos los botones de solo icono de la aplicación con el mismo criterio. Las
tarjetas del feed en escritorio los tienen bien (`aria-label="Dar like"`), pero los lápices y las
papeleras de la despensa habría que comprobarlos uno a uno.

**Hecho el 18/09/2026.** El botón vive en `headerDiscover.tsx`, no en `contenidoDiscover.tsx` como
decía la tabla. Lleva `aria-label="Abrir filtros"`, y cuando hay filtros puestos
`Abrir filtros (N activos)`, porque ese número solo se veía en la insignia. De paso, la «x» de borrar
la búsqueda, que estaba al lado y tampoco tenía nombre, es «Borrar la búsqueda».

Repasados los de la despensa: los lápices y las papeleras ya venían con `aria-label` (`Editar {nombre}`,
`Eliminar {nombre}`). En el panel de preferencias los iconos de alérgeno pasaron a `alt=""`, que es lo
correcto: la etiqueta de texto va al lado y un lector de pantalla los leía dos veces.

### UI-006 · El color de marca no llega a AA (seria)

`--brand` es `#ad5600`. Sobre los fondos cálidos de la propia aplicación:

| Combinación | Contraste | AA (4,5:1) |
|---|---|---|
| `#ad5600` sobre `#f3e5d6` (`--warm-bg`) | 4,14:1 | ✗ |
| `#ad5600` sobre `#f9e8d6` (`--warm-bg-accent`) | 4,27:1 | ✗ |
| `#ad5600` sobre `#fdfcfa` (fondo) | 4,83:1 | ✓ |

Afecta al ítem activo de la barra lateral, al de la barra inferior, al banner de «Recetas para ti» y a
todo el texto pequeño en color de marca sobre superficie cálida. Es la violación con más alcance de
las tres: no es un componente, es el sistema de color.

No hay que cambiar la identidad. Basta con un tono más oscuro reservado para texto sobre fondo cálido:
**`#8f4700` da 5,9:1 sobre `--warm-bg`** y a simple vista es el mismo naranja. Se declara como
`--brand-texto` en `globals.css` y se usa en las combinaciones de la tabla; `--brand` se queda para
rellenos, bordes e iconos grandes, donde el umbral es 3:1 y sí lo cumple.

Para el modo oscuro hay que rehacer la comprobación cuando exista: hoy no hay.

### UI-009 · `<main>` dentro de `<main>` (moderada)

`app/(main)/layout.tsx:10` envuelve todo en un `<main>`, y encima `/discover`, `/coleccion`,
`/despensa`, `/perfil`, `/home` y `/crear-receta` añaden el suyo. Dos `<main>` en el documento: la
navegación por regiones de un lector de pantalla deja de funcionar y el salto directo al contenido
principal es ambiguo.

Arreglo: el `<main>` se queda en el layout y las páginas usan `<div>` o `<section>`. Una sola línea por
fichero.

### UI-009b · Contenido fuera de landmarks y jerarquía de encabezados

- `region` en móvil: la cabecera del feed y la barra inferior están fuera de cualquier landmark.
  `<header>` en `headerHome.tsx` y `<nav aria-label="Navegación principal">` en `navBarInferior.tsx`
  (que ya es `<nav>`, le falta el nombre).
- `page-has-heading-one` en `/home`: la portada no tiene `<h1>`. El logotipo «Cookr» de la cabecera es
  un `<span>`. Poner el `<h1>` visualmente oculto («Tu feed de recetas») o convertir el logotipo.
- `heading-order` en `/coleccion` y en el detalle: se salta de `<h1>` a `<h3>`. Las tarjetas del feed
  de escritorio usan `<h2>` para el destacado y `<h3>` para las demás, lo que en la práctica dice que
  unas recetas son subsecciones de otras. Todas deberían ser del mismo nivel.
- `list` en el detalle: `<ol class="list-none p-0 m-0">` con hijos que no son `<li>`.

### Lo que no detecta axe pero se ve al usar la aplicación

**No hay enlace de salto al contenido.** Con teclado, cada cambio de página obliga a pasar por los seis
ítems de la barra lateral antes de llegar al feed.

**El foco visible depende del componente.** Los botones de shadcn traen su anillo, pero los
`<button>` escritos a mano (las acciones de las tarjetas, «Ver todos» de los comentarios, el botón de
generar con IA) no declaran `focus-visible` y heredan el del navegador, que sobre fondo cálido apenas
se distingue. Conviene una regla global en `globals.css` con el anillo de marca.

**La animación no respeta `prefers-reduced-motion`.** Framer Motion está en las tarjetas, en el
indicador de la barra, en el corazón y en el marcador. No hay ninguna comprobación de la preferencia
del sistema. Se resuelve de una vez envolviendo la aplicación en `<MotionConfig reducedMotion="user">`.

**Los alérgenos se comunican con color y forma de chip.** `ChipAlergeno` lleva texto, así que se lee,
pero el estado bloqueado del drawer de filtros (los alérgenos del perfil, marcados y deshabilitados con
un candado) necesita `aria-describedby` que explique por qué no se pueden tocar. Es información de
salud: que un lector de pantalla diga solo «casilla marcada, deshabilitada» no basta.

---

## 4 · Usabilidad y primera vez

### Lo que ya está bien resuelto

El tutorial de crear receta que salta solo cuando el usuario no tiene ninguna receta
(`formularioCrearReceta.tsx:84-88`) es buena idea: aparece cuando hace falta y no molesta después. El
drawer de filtros que muestra los alérgenos del perfil bloqueados con enlace al perfil explica una
regla del sistema en el sitio donde importa. Y «Crear desde descripción (IA)» está justo arriba del
formulario, que es donde un usuario nuevo va a mirar.

### UI-013 · No hay estado vacío con salida

Con la despensa vacía, la colección vacía o el feed sin resultados, lo que aparece es un texto centrado
y poco más. `feedHomePc.tsx:103-112` es el mejor de todos (icono, titular, explicación) y aun así no
ofrece ninguna acción. Los estados vacíos son la mejor oportunidad de enseñar qué hace la aplicación:
cada uno debería llevar un botón al camino natural («Añadir mi primer ingrediente», «Explorar recetas»,
«Quitar los filtros»).

### UI-014 · Los filtros activos no se ven una vez cerrado el drawer

Al aplicar filtros en el feed, el drawer se cierra y nada indica que sigan puestos. El botón «Filtros»
queda idéntico. Si el usuario filtró por dificultad hace diez minutos y ahora no encuentra una receta,
no tiene forma de saber por qué. Hacen falta dos cosas: un contador en el botón (`Filtros · 3`) y una
fila de chips quitables bajo el buscador, con «Limpiar todo».

Esto se nota más con los alérgenos del perfil: filtran siempre, no aparecen en ningún sitio del feed y
el usuario no tiene por qué recordar que los puso al registrarse. Un aviso discreto («Ocultamos las
recetas con lácteos, según tu perfil») evita que parezca que faltan recetas.

### UI-015 · La búsqueda no perdona una tilde ni un plural

`?q=` hace `$regex` sobre título y descripción. «tortelini» no encuentra «Tortellini», «pure» no
encuentra «Puré», «garbanzo» no encuentra «Garbanzos». Ya está recogido como bloque F15 del plan;
lo repito aquí porque en la prueba de producción fue el tropiezo más frecuente.

Mientras llega F15, algo barato ayuda mucho: guardar un campo normalizado (sin tildes, en minúsculas)
al crear y editar, y buscar contra él. Resuelve las tildes y las mayúsculas, que son la mitad de los
fallos, sin tocar la infraestructura.

### UI-016 · Discover enseña un evento que no existe ✅

`EVENTO_DESTACADO_MOCK` en `features/discover/data/datosDiscover.ts` pinta «Semana de la Cocina
Mediterránea» a todo el mundo, siempre, y no lleva a ninguna parte. Es contenido falso en producción.
Va en su propio documento: `estado/eventos.md`.

**Hecho el 18/09/2026.** Fuera la constante y fuera el bloque que la pintaba en
`contenidoDiscover.tsx`. `TarjetaDestacada` y el tipo `EventoDestacado` **se quedan en el repositorio a
propósito**: son la pieza de presentación que van a reutilizar los eventos de verdad de
`estado/eventos.md`. Lo que se ha quitado es el dato inventado, no el componente.

### UI-017 · Dos vocabularios de dificultad conviviendo

El formulario maneja `facil | media | dificil`, la base de datos guarda `Fácil | Media | Difícil`, y
`MAPA_DIFICULTAD` (`backend/src/repositories/recetaRepository.ts:17-21`) traduce al crear y al editar.
El drawer de filtros manda los valores con tilde y mayúscula
(`drawerFiltros.tsx:21`) porque es lo que hay guardado.

Funciona, pero el filtro de dificultad depende de que el drawer escriba «Difícil» exactamente igual que
la base de datos, tilde incluida. Un día alguien normaliza un literal y el filtro devuelve cero sin que
ningún test se entere. La conversión debería estar en un solo sitio (el repositorio, en las dos
direcciones) y el resto de la aplicación hablar siempre en minúsculas sin tildes.

---

## 5 · Deuda pequeña que salió de paso

- **`tiempoRelativo` sigue duplicada.** REV-007 unificó dos de las tres copias en `lib/tiempo.ts`. La
  de `tarjetaPost.tsx:12-19` sigue aparte, con su propio formato («Hace 88d») y sin el `Math.max(0, …)`
  que evita el «Hace -1m». Unificarla cambia el texto que se ve en el feed, así que es decisión de
  copia: o el feed adopta «hace 88 d», o `lib/tiempo.ts` exporta las dos variantes.
- **`CATEGORIAS_DISCOVER` no la usa nadie.** Código muerto desde que Discover dejó de pasar
  `categoria` (UI-012). O se conecta o se borra.
- **No hay forma de borrar un comentario.** Ni para su autor ni para el de la receta. Falta
  `DELETE /api/recetas/:id/comentarios/:comentarioId` con la comprobación de permiso y el decremento de
  `numComentarios` en la misma operación.
- **Sin modo oscuro.** `globals.css` no declara variables para `prefers-color-scheme: dark`. No es
  urgente, pero conviene decidirlo antes de repartir tokens de color nuevos por UI-006, para no tener
  que hacer el trabajo dos veces.

---

## Orden de ataque

**Primero, lo que está roto** (una tarde): ✅ cerrado el 18/09/2026

1. ~~UI-003, el like y el guardar de escritorio.~~ Hecho, sin el ancla `#comentarios`.
2. ~~UI-007 y UI-008, las tres violaciones críticas de accesibilidad.~~ Hechas.
3. UI-009, el `<main>` anidado. Una línea por fichero. **Sigue abierto**: es el único de este bloque
   que no se tocó, y conviene hacerlo junto a UI-005, que mueve los mismos ficheros.
4. ~~UI-010, el FAB que tapa un campo del formulario.~~ Hecho con la opción 1.
5. ~~UI-001, el hueco del bento.~~ Hecho, más el `flex-1` de las imágenes que UI-002 necesitaba de
   verdad.

**Después, el espacio y la accesibilidad de fondo** (dos o tres días):

6. UI-006, el tono de marca para texto sobre fondo cálido, con la revisión de contrastes entera.
7. ~~UI-004, los anchos de despensa, colección y perfil.~~ Hecho el 18/09/2026, las cuatro pantallas.
8. UI-011, el punto de corte `md` para tablet.
9. UI-014, los filtros activos visibles.

**Luego, lo estructural** (una semana):

10. UI-005, un solo árbol por pantalla.
11. UI-017, un solo vocabulario de dificultad.
12. UI-013, estados vacíos con salida.
13. Enlace de salto al contenido, `focus-visible` global y `MotionConfig reducedMotion="user"`.

El formulario de crear receta va por su cuenta en `docs/diseno/formulario-crear-receta.md`, los eventos
en `docs/estado/eventos.md` y la aplicación instalable en `docs/estado/pwa.md`.

---

## Cómo se midió

Playwright contra `https://tfg-alejandro-hernandez-gonzalez.vercel.app`, sesión de `maria@cookr.dev`,
en 1440×900, 768×1024 y 390×844. axe-core 4.10.2 inyectado desde cdnjs en cada ruta, filtrando solo
violaciones. Los anchos de contenedor salen de `getBoundingClientRect()` sobre el `<main>` y las
rejillas; los contrastes, del cálculo de axe sobre los colores computados.

Rutas recorridas: `/home`, `/discover`, `/despensa`, `/coleccion`, `/perfil`, `/chat`, `/crear-receta` y
`/recetas/[id]`.
