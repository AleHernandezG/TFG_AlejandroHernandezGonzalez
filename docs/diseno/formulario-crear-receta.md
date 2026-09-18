# Cómo rehacer el formulario de crear receta

Cuatro formas de plantearlo, con lo que cuesta cada una y lo que se gana. Al final hay una
recomendación, que es una mezcla de dos.

Publicar una receta es la acción más cara de Cookr: quince campos, dos listas que crecen, una foto y
una decisión sobre alérgenos. También es la que más define el producto, porque una red social de
recetas sin recetas no es nada. Merece la pena pensarla bien.

---

## Lo que hay hoy

`/crear-receta` es una sola página con seis bloques apilados, dentro de un contenedor de **390 px de
ancho fijo en cualquier pantalla** (`app/(main)/crear-receta/page.tsx:71`), sobre una fotografía a
pantalla completa con un velo negro al 45 %.

```
Crear desde descripción (IA)     ← botón, abre un diálogo
┌──────────────────────────┐
│ Foto                     │
│ Información básica       │     título, descripción, tiempo, porciones, dificultad
│ Tipo de receta           │     chips de dietas
│ Ingredientes             │     lista dinámica: nombre + cantidad + unidad
│ Pasos                    │     lista dinámica de textos
│ Alérgenos                │     detectados automáticamente + los que añada el autor
└──────────────────────────┘
        [Continuar]              → /crear-receta/revisar
```

Al enviar, si algo falla se abre un diálogo con la lista de errores y un botón «Corregir» que hace
scroll al primero. Si todo va bien, navega a `/crear-receta/revisar`, que ya es **una previsualización
completa de la receta tal como quedará publicada** (`previsualizacionReceta.tsx`, 323 líneas), con
botón de publicar.

### Qué funciona

- **El atajo de IA está donde tiene que estar**, arriba del todo y no escondido. Describir la receta
  con palabras y que el formulario se rellene solo es el mejor argumento del producto.
- **La detección de alérgenos en vivo** mientras se escriben los ingredientes es exactamente lo que
  pide una funcionalidad de salud: enseñarla antes de publicar, no después.
- **Ya existe una previsualización fiel.** Esto es importante para lo que viene: no hay que inventar un
  componente de vista previa, hay que moverlo de sitio.
- El tutorial que salta solo la primera vez, sin volver a aparecer.

### Qué no

| Problema | Consecuencia | Estado |
|---|---|---|
| 390 px fijos en 1440 | En escritorio se rellena un formulario del tamaño de un móvil con una foto decorativa alrededor | ✅ 18/09 (provisional) |
| El fondo fotográfico compite con los campos | El velo al 45 % no basta: el texto de ayuda se lee sobre trozos de piña | ✅ 18/09 (provisional) |
| La previsualización está al final | El autor escribe a ciegas y descubre cómo queda cuando ya no quiere cambiar nada | abierto, lo resuelve el asistente |
| Los errores llegan de golpe al enviar | Diez campos mal a la vez, en un diálogo, con un botón que lleva al primero | ✅ 18/09 |
| Dos `<select>` sin nombre accesible | UI-007, violación crítica | ✅ 17/09 |
| El FAB tapa el campo PORCIONES en móvil | UI-010 | ✅ 18/09 |
| No se guarda nada | Si el navegador se cierra a la mitad, se pierde todo. Hay un store de Zustand (`useCrearRecetaStore`) pero solo se rellena al enviar | ✅ 18/09 |

### Arreglos prioritarios, hechos el 18/09/2026

Antes de rehacer nada. Tres de los cinco que quedaban sobreviven enteros al asistente; los otros dos
son provisionales y se tiran cuando el formulario pase a diálogos, pero la aplicación está en
producción mientras tanto.

**Borrador persistido.** `useCrearRecetaStore` pasa a usar el middleware `persist` de Zustand contra
`localStorage`, con la clave `cookr-borrador-receta`. Se guardan `borrador`, `fotoPreview` y
`guardadoEn`; **`datos` no se persiste** a propósito, porque lleva el `File` de la foto (que no
sobrevive a `JSON.stringify`) y porque un `datos` viejo haría que `/crear-receta/revisar` enseñara una
receta que ya no se está escribiendo.

El formulario se suscribe a `watch` y vuelca los valores 600 ms después de la última tecla. No guarda
nada mientras el formulario esté vacío (`tieneContenido`), así que nadie se encuentra un aviso de
borrador recuperado por haber entrado y salido. Al volver, `reset` mezcla el borrador sobre los valores
iniciales —nunca lo sustituye, o `useFieldArray` se queda sin arrays— y sale un aviso con «Empezar de
cero». La foto se restaura desde `fotoPreview`, que es la URL de Cloudinary ya subida, así que no hay
que volver a subirla.

`limpiar()` y `descartarBorrador()` borran también lo persistido, de modo que publicar o pulsar «Borrar
y salir» dejan el sitio limpio para la siguiente receta.

**Validación campo a campo.** `mode: 'onBlur'` más `reValidateMode: 'onChange'`: el error aparece al
salir del campo y desaparece mientras se corrige, no en el siguiente envío. El diálogo de errores se
queda como resumen al enviar, que para eso sirve.

**Ancho y fondo (provisionales).** El contenedor pasa de `max-w-[390px]` a `max-w-[420px]
md:max-w-2xl`, y tiempo y porciones se ponen en dos columnas a partir de `md`. El velo sube de 45 % a
55 % con un desenfoque de 3 px, y a 65 % con 6 px en `lg`, que es donde la fotografía ocupa más
pantalla. El crédito de Unsplash se queda donde estaba.

---

## Opción A · Arreglar lo que hay

No cambiar la estructura. Quitar el ancho fijo, calmar el fondo, validar campo a campo y guardar un
borrador.

```
lg:                                      móvil (sin cambios de estructura)
┌────────────┬────────────┐              ┌──────────┐
│ Foto       │ Información│              │ Foto     │
│            │ básica     │              │ Info     │
├────────────┴────────────┤              │ Tipo     │
│ Ingredientes            │              │ Ingred.  │
│ Pasos                   │              │ Pasos    │
│ Alérgenos               │              │ Alérgenos│
└─────────────────────────┘              └──────────┘
```

**Cambios concretos:** `max-w-[390px]` pasa a `max-w-xl lg:max-w-4xl`; el fondo fotográfico se queda
solo en la cabecera (unos 200 px de alto) en vez de a pantalla completa; `mode: 'onBlur'` en el
`useForm` para que el error salga al salir del campo y no al enviar; el diálogo de errores se queda
solo como resumen accesible, con `role="alert"`; `aria-label` en los dos `<select>`; y un
`useEffect` que vuelca el formulario a `useCrearRecetaStore` con `persist` cada pocos segundos.

**Coste:** uno o dos días. **Riesgo:** ninguno.
**Lo que no resuelve:** el autor sigue sin ver cómo queda su receta hasta el final.

Esta opción no compite con las demás, es **el suelo de todas ellas**. Aunque se elija otra, estos
arreglos hay que hacerlos.

---

## Opción B · Diálogos independientes (asistente por pasos)

Un paso por diálogo: foto → datos → ingredientes → pasos → alérgenos → revisar.

```
        ● ─── ● ─── ○ ─── ○ ─── ○ ─── ○
      Foto  Datos Ingr. Pasos Alérg. Revisar

        ┌───────────────────────────┐
        │  Paso 3 de 6              │
        │  ¿Qué lleva tu receta?    │
        │                           │
        │  [ Harina  ][200][ g  ] ✕ │
        │  [ Huevos  ][  2][uds ] ✕ │
        │  + Añadir ingrediente     │
        │                           │
        │  ⚠ Detectamos: gluten,    │
        │    huevo                  │
        │                           │
        │  [ Atrás ]      [Seguir]  │
        └───────────────────────────┘
```

**A favor.** Es lo que recomienda Nielsen Norman Group para procesos complejos: menos agobio, menos
carga cognitiva, y cada paso tiene sitio de sobra para campos grandes y bien separados. En móvil
funciona especialmente bien porque cada pantalla cabe sin scroll. La validación es natural: no se pasa
de paso sin cumplirlo, así que los errores llegan de uno en uno y en contexto.

**En contra.** Para una receta larga son seis pantallas y cinco clics de «Seguir» antes de ver nada.
Y el asistente por pasos castiga la edición: cambiar una cosa del paso 2 cuando estás en el 5 obliga a
navegar hacia atrás y perder el sitio. NN/G avisa además de la trampa clásica, que es **borrar lo que
el usuario ya escribió al volver atrás**; con React Hook Form manteniendo un único `useForm` para todo
el asistente esto se evita, pero hay que hacerlo a propósito.

**Accesibilidad.** El indicador de pasos tiene que ser una lista con `aria-current="step"`, el foco
debe moverse al encabezado de cada paso al cambiar, y el cambio hay que anunciarlo por una región
`aria-live`. Si se hace con diálogos de Radix de verdad, hay que vigilar la trampa de foco encadenada
entre diálogos, que es donde suelen romperse estos flujos.

**Coste:** tres o cuatro días. **Riesgo:** medio; hay que rehacer la navegación y el estado.

Mi lectura: encaja bien en móvil y se queda corta en escritorio, donde sobra espacio para enseñar más
de un paso a la vez. Un asistente que solo usa el 30 % de una pantalla de 1440 px desaprovecha lo mismo
que el formulario de hoy.

---

## Opción C · Editor con previsualización en vivo

La pantalla se parte: los campos a la izquierda, la receta montándose a la derecha, en tiempo real.

```
┌──────────────────────────┬─────────────────────────────┐
│ ☐ Foto                   │  ┌───────────────────────┐  │
│                          │  │                       │  │
│ Título   [____________]  │  │      (tu foto)        │  │
│ Descrip. [____________]  │  │                       │  │
│                          │  ├───────────────────────┤  │
│ ⏱ [30] min  🍽 [4]       │  │ Tarta de manzana      │  │
│ Dificultad ●Fácil ○Media │  │ ⏱ 30 min · 4 raciones │  │
│                          │  │ [Fácil] [Sin lactosa] │  │
│ Ingredientes             │  │                       │  │
│  [Manzana][3][uds]  ✕    │  │ Ingredientes          │  │
│  [Harina ][200][g]  ✕    │  │  · 3 uds manzana      │  │
│  + Añadir                │  │  · 200 g harina       │  │
│                          │  │                       │  │
│ Pasos                    │  │ ⚠ Contiene: gluten    │  │
│  1. [_______________]    │  └───────────────────────┘  │
│  + Añadir paso           │   ↑ se actualiza al teclear │
└──────────────────────────┴─────────────────────────────┘
        [Guardar borrador]            [Publicar]
```

**A favor.** Es el patrón de previsualización en vivo de toda la vida, el que resuelve «quiero ver cómo
queda esto sin tener que enviarlo», y desde hace un par de años es la manera estándar de plantear un
editor de contenido: se construye a la izquierda, se ve a la derecha. Elimina de un plumazo la
pregunta «¿se verá bien mi receta?», que hoy solo se responde en la última pantalla.

Y lo mejor para este proyecto: **la mitad derecha ya está escrita**. `previsualizacionReceta.tsx`
pinta la receta con los datos del store. Basta con alimentarla desde `watch()` del formulario en vez de
desde el store, y la vista previa vive a la izquierda del botón de publicar en lugar de en otra ruta.

**En contra.** En móvil no hay dos columnas. La solución no es apilar el formulario y la previsualización
(el autor no ve la previsualización sin hacer scroll, con lo que vuelve a estar ciego): es un botón
fijo de «Ver cómo queda» que abre la previsualización en una hoja inferior a pantalla completa, con el
mismo componente. También cuesta rendimiento: repintar la previsualización en cada tecla se nota. Se
arregla con `useWatch` por secciones y un *debounce* de 200 ms sobre los campos de texto largo.

**Accesibilidad.** La previsualización es contenido que cambia solo, así que va en un contenedor con
`aria-live="polite"` y `aria-atomic="false"`, y **fuera del orden de tabulación**: nadie debe tener que
atravesar la receta entera para llegar al siguiente campo. Los cambios se anuncian de forma resumida
(«Previsualización actualizada: 3 ingredientes») y no leyendo la receta completa cada vez, que sería
insoportable. En móvil, la hoja de previsualización es un diálogo modal normal y no tiene ninguno de
estos problemas.

**Coste:** tres días, y uno de ellos es rendimiento. **Riesgo:** bajo, porque el componente pesado ya
existe y está probado.

---

## Opción D · Bento con tarjetas editables

Lo que planteabas: una rejilla de bloques donde cada bloque es a la vez el campo y su previsualización.
Se escribe encima de la receta, no en un formulario aparte.

```
┌───────────────────────────┬──────────────┐
│                           │ ⏱ 30 min     │
│    (foto — arrastra o     │ 🍽 4         │
│     pulsa para subir)     │ ⚙ Fácil      │
│                           ├──────────────┤
│  Tarta de manzana         │ ⚠ Alérgenos  │
│  ▏escribe una descripción │ gluten       │
├───────────────────────────┴──────────────┤
│ Ingredientes            │ Pasos          │
│ · 3 uds manzana         │ 1. Pelar...    │
│ · 200 g harina          │ 2. Hornear...  │
│ + añadir                │ + añadir       │
└─────────────────────────┴────────────────┘
```

**A favor.** Es lo más bonito y lo que mejor encaja con el aire de Cookr, que ya usa bento en el feed de
escritorio. No hay salto entre «lo que escribo» y «lo que se ve», porque son la misma cosa. Y transmite
mejor que ninguna otra opción la idea de que estás componiendo un plato, no rellenando un impreso.

**En contra, y es serio.** Un bento reordena bloques visualmente, y ahí está la trampa documentada del
patrón: **el orden visual y el orden del DOM dejan de coincidir**, con lo que un lector de pantalla y la
navegación con teclado recorren la pantalla por un camino distinto del que se ve. En un panel de solo
lectura es molesto; en un formulario donde el orden de tabulación es la forma de rellenarlo, es una
barrera. MDN lo dice sin rodeos: reordenar con CSS Grid no cambia el orden de lectura ni el de
tabulación. Incumple WCAG 2.4.3 (orden del foco) y 1.3.2 (secuencia significativa).

Se puede hacer bien, y la regla es conocida: **escribir el DOM en orden de lectura y hacer la maqueta
solo con `span`, nunca con `dense`**. Pero eso limita mucho lo que se puede componer, y entonces buena
parte de la gracia del bento se pierde.

Hay un segundo problema, más pedestre: **la edición en el sitio esconde los campos**. Si «Tarta de
manzana» es texto hasta que lo pulsas, el usuario nuevo no sabe que es editable, ni cuáles son
obligatorios, ni dónde meter el tiempo. Los editores tipo Notion lo resuelven con años de costumbre
acumulada y con marcadores de posición muy explícitos; una aplicación que se usa dos veces al mes no
tiene ese margen. Hay que mantener etiquetas visibles, bordes de campo y asteriscos de obligatorio, y
en cuanto los pones, el bento se parece bastante a un formulario de dos columnas bien maquetado, que es
la opción C.

**Coste:** una semana larga, más el tiempo de resolver la accesibilidad. **Riesgo:** alto.

---

## Decisión tomada el 18/09/2026

**Opción A de base y luego B y C, pero repartidas por tamaño de pantalla.** El asistente es la columna
vertebral en las dos, y no hace falta que el resultado sea el mismo en un móvil que en un monitor:

| Ancho | Qué se ve |
|---|---|
| `< 1024 px` | **Opción B.** Asistente por pasos: un diálogo por bloque de la receta, a pantalla completa |
| `≥ 1024 px` | **Opción B + C.** El mismo diálogo, ancho y partido en dos: campos a la izquierda, previsualización en vivo **de ese bloque** a la derecha, con la página atenuada detrás |

En las dos, `/crear-receta/revisar` **se queda como está**: la previsualización completa de la receta
tal como quedará publicada, con el botón de publicar. El asistente no la sustituye, la precede.

Lo que esto descarta de la recomendación original: la pantalla partida con la previsualización
pegajosa al lado del formulario. La previsualización en escritorio vive dentro del diálogo del bloque
que se está rellenando, no en un panel permanente al margen.

Queda por decidir, y no bloquea empezar: si el diálogo de escritorio enseña además un mapa de los seis
bloques con su estado, o si el progreso se lleva solo con la barra de pasos.

### Recomendación original (superada por lo de arriba)

**Opción A como base, opción C encima.** Concretamente:

| Ancho | Qué se ve |
|---|---|
| `< 768 px` | Una columna, secciones colapsables, botón fijo «Ver cómo queda» que abre la previsualización en una hoja a pantalla completa |
| `768–1023 px` | Dos columnas de formulario (datos arriba, ingredientes y pasos lado a lado), mismo botón de previsualización |
| `≥ 1024 px` | Formulario a la izquierda (60 %), previsualización pegajosa a la derecha (40 %) |

Y de la opción D se coge lo que no cuesta accesibilidad: **la previsualización de la derecha se
pincha**. Al pulsar sobre el título de la receta previsualizada, el foco salta al campo título del
formulario y lo resalta. Es navegación, no edición en el sitio, así que no rompe el orden de tabulación
(el propio `<button>` va en el DOM donde toca), y da buena parte de la sensación de estar tocando la
receta de verdad.

De la opción B se coge el indicador de progreso, pero **sin partir el formulario**: una barra lateral o
superior con las seis secciones, cada una con su estado (vacía, incompleta, lista), que hace scroll a
la sección al pulsarla. El usuario ve cuánto le queda sin perder la vista de conjunto. Es lo que hacen
los formularios largos bien hechos y no arrastra ninguno de los problemas de navegación del asistente.

#### Por qué esta y no otra

`previsualizacionReceta.tsx` ya existe, ya está probado en producción y ya sabe pintar una receta a
partir de los datos del formulario. La opción C es, en gran medida, moverlo de ruta. Las opciones B y D
empiezan de cero y compiten con la que reaprovecha lo que hay.

Y hay un motivo de producto: Cookr ya tiene un camino rápido para quien no quiere pelearse con un
formulario, que es «Crear desde descripción (IA)». El formulario manual no tiene por qué ser el más
rápido; tiene que ser el más **controlable**. Enseñar el resultado mientras se escribe es exactamente
eso.

### Orden de trabajo

1. ~~La base de la opción A: ancho, fondo, `onBlur`, `aria-label` de los dos `<select>`, borrador
   persistido.~~ **Hecho el 18/09/2026.**
2. Partir la previsualización por bloques. `previsualizacionReceta.tsx` pinta la receta entera; hace
   falta poder pedirle solo la cabecera, solo los ingredientes o solo los pasos, sin duplicar el
   maquetado ni tocar lo que enseña `/crear-receta/revisar`. Es el trabajo con más riesgo de los cinco
   y conviene hacerlo antes que el asistente, no a la vez.
3. El armazón del asistente: estado del paso, navegación adelante y atrás, validación **por bloque** con
   `trigger` de los campos de ese paso. Volver atrás no borra nada escrito (NN/G).
4. El diálogo de escritorio partido en dos, con la previsualización del bloque alimentada por
   `useWatch`, `aria-live="polite"` y fuera del orden de tabulación.
5. Los pasos en móvil a pantalla completa, con el indicador de progreso y `aria-current="step"`.

Del 2 al 5 el orden importa. El 2 es útil por sí solo aunque el asistente se quede a medias.

Dos cosas que hay que mirar antes de escribir el 3: el `Dialog` de shadcn atrapa el foco, así que
encadenar diálogos (el del asistente y el de «Crear desde descripción») pide cerrar uno antes de abrir
el otro; y el tutorial de la primera vez (`PopUpTutorial` + `TutorialCrearReceta`) tiene que decidir
dónde encaja, porque hoy sustituye el formulario entero.

### Qué medir después

Si se hace, conviene saber si sirvió. Tres números, todos sacables de la propia aplicación: cuántos
formularios empezados acaban publicados, cuánto se tarda de media, y cuántas recetas se editan en la
hora siguiente a publicarlas (esa última es la que dice si el autor vio venir el resultado o se llevó
una sorpresa).

---

## Referencias

Patrón y maquetación:

- [Preview design pattern — UI Patterns](https://ui-patterns.com/patterns/LivePreview). La ficha
  canónica del patrón: el usuario quiere comprobar cómo afecta al resultado lo que escribe, y cuanto
  antes mejor.
- [Web Layout Best Practices: 12 Timeless UI Patterns Explained — UXPin](https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/).
  La pantalla partida como forma de dar el mismo peso a dos cosas que se miran a la vez.
- [Patrones de flujo en SaaS (recopilación)](https://gist.github.com/mpaiva-cc/d4ef3a652872cb5a91aa529db98d62dd).
  Catálogo del «editor a la izquierda, previsualización a la derecha» tal como lo usan los productos
  actuales.

Formularios por pasos:

- [Wizards: Definition and Design Recommendations — NN/G](https://www.nngroup.com/articles/wizards/).
  Cuándo compensa partir un proceso, y el aviso de no borrar nunca lo escrito al volver atrás.
- [Better Forms Through Visual Organization — NN/G](https://www.nngroup.com/videos/better-forms-visual-organization/).
  Agrupar campos y ordenarlos visualmente, que es lo que sostiene la opción C.
- [Must-Follow UX Best Practices When Designing A Multi Step Form — Growform](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/).

Bento, y por qué hay que tener cuidado:

- [Grid layout and accessibility — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Accessibility).
  Reordenar con CSS Grid no cambia el orden de lectura ni el de tabulación. Es la fuente que hay que
  leer antes de tocar `grid-auto-flow: dense`.
- [Bento Grid: CSS and Tailwind Recipe, Real Examples and Limits — Superdesign](https://superdesign.dev/styles/bento-grid).
  La regla práctica: DOM en orden de lectura, la maqueta con `span`, `dense` solo para bloques no
  interactivos.
- [Bento Grid Layouts 2026 — Studio Meyer](https://studiomeyer.io/en/blog/bento-grid-layouts).
  Cómo lo usan Apple y Google, con código.
- [The Bento Grid Principle — Jed Brown](https://medium.com/design-den/the-bento-grid-principle-2427c95adc40).
  De dónde viene la idea, que ayuda a decidir qué bloques merecen ser grandes.

Edición en el sitio, si algún día se quiere la opción D:

- [Yoopta Editor](https://github.com/yoopta-editor/Yoopta-Editor). Editor por bloques al estilo Notion
  para React. Vale la pena mirar cómo resuelve el foco entre bloques aunque no se use.

Referencia de producto:

- [Recipe detail screens — Mobbin](https://mobbin.com/explore/mobile/screens/recipe-detail). Catálogo de
  pantallas reales de aplicaciones de recetas. Útil para decidir qué tiene que enseñar la
  previsualización, que es lo mismo que enseña el detalle.
- [Best Recipe Management Software in 2026 — Cooklang](https://cooklang.org/blog/48-best-recipe-management-software/).
  Comparativa de nueve aplicaciones; interesa cómo plantea cada una el alta de receta.
