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

### Dos decisiones que el asistente obliga a tomar

Partir el formulario en diálogos toca dos cosas que hoy conviven con él y que no caben tal cual. Están
decididas y no hay que volver sobre ellas al implementar.

**El atajo de IA deja de ser un diálogo propio.** «Crear desde descripción» pasa a ser **otra vista
dentro del diálogo del asistente**, a la que se llega desde su cabecera en cualquier paso. El motivo es
técnico y no tiene vuelta: el `Dialog` de Radix atrapa el foco, así que dos diálogos abiertos a la vez
encadenan dos trampas y quien navega con teclado o lector de pantalla se queda dando vueltas en la
ventana equivocada. Una ventana que enseña otra cosa no tiene ese problema.

Se descartó ponerlo como paso 0 («¿la describes o la escribes?») porque cobra una pantalla de decisión
a todo el mundo, incluido quien entra sabiendo lo que quiere. Y se descartó dejarlo en la página, fuera
del asistente, porque entonces el atajo desaparece justo cuando aparecen las ganas de usarlo, que es a
mitad de rellenar los pasos, no antes de empezar.

Con esto llega un caso que hoy no existe: `methods.reset(generado)` **machaca lo escrito**. Ahora da
igual porque el botón vive encima de un formulario vacío, pero dentro del asistente hay que preguntar
antes de sustituir si ya hay contenido.

**El carrusel del tutorial se borra.** `TutorialCrearReceta` (103 líneas, tres diapositivas que hoy
sustituyen el formulario entero) desaparece, y sus tres consejos —la foto, las cantidades con unidad,
revisar antes de publicar— pasan a ser **una línea de ayuda en el paso al que pertenecen**. Dicho en el
paso, el consejo es ayuda; dicho cinco minutos antes de que exista el campo, es un peaje.

`PopUpTutorial` se queda: es una bienvenida de una sola vez, aparece cuando el usuario no tiene ninguna
receta y ahora abre el asistente en vez del carrusel. Eso no estorba a nadie.

### La previsualización, partida por bloques el 18/09/2026

El punto 2 del orden de trabajo, hecho antes que el asistente para no arrastrar el riesgo.

`previsualizacionReceta.tsx` baja de 323 a 169 líneas y deja de pintar la receta: ahora compone
bloques que viven en `components/crearReceta/previsualizacion/`, uno por trozo de receta.

| Bloque | Qué pinta | Qué hay que darle |
|---|---|---|
| `HeroPrevisualizacion` | Foto, degradado y crédito de Pexels | `src`, `alt`, `credito`, `textoVacio` y `children` para lo que vaya encima (hoy, el botón de volver) |
| `CabeceraPrevisualizacion` | Dietas, dificultad, alérgenos, título, descripción y fila de autor | `titulo`, `descripcion`, `dietas`, `dificultad`, `alergenos`, `mostrarAutor` |
| `MetaPrevisualizacion` | Las dos píldoras: tiempo y porciones | `tiempo`, `unidadTiempo`, `porciones`, `className` |
| `IngredientesPrevisualizacion` | Encabezado con el recuento y la lista | `ingredientes` y el hueco `meta` |
| `NutricionPrevisualizacion` | El marcador de Edamam | nada |
| `PasosPrevisualizacion` | La lista numerada | `pasos`, `pasoResaltado` y los huecos `acciones` y `controles` |
| `AlergenosPrevisualizacion` | Chips y aviso | `alergenos`; devuelve `null` si no hay ninguno |
| `DivisorPrevisualizacion` | La línea entre secciones | nada |

Ninguno lee el store. Reciben los datos por props, así que el asistente podrá alimentarlos desde
`useWatch` sin pasar por `useCrearRecetaStore`; quien lee el store es la página de revisar, que es la
que sabe de dónde vienen los datos. Dos cosas que no son evidentes:

**El modo manos libres no vive dentro de los pasos.** `PasosPrevisualizacion` recibe el botón y la
barra de controles como huecos y solo sabe qué paso resaltar. `useModoManoLibres` se queda en
`previsualizacionReceta.tsx`, que es su sitio: leer la receta en voz alta mientras se rellena el paso
4 del asistente no lo pide nadie.

**Las píldoras de tiempo y porciones son un hueco de los ingredientes.** Visualmente caen dentro de
esa sección, pero pertenecen al bloque de datos básicos. Pasarlas como `meta` deja que el asistente
las enseñe con los datos y que la página de revisar las siga enseñando donde estaban, sin duplicar el
contenedor ni descuadrar los márgenes.

`/crear-receta/revisar` enseña exactamente lo mismo que antes: el reparto no cambia ni una clase de
Tailwind ni el orden del DOM.

### El armazón del asistente, hecho el 18/09/2026

El punto 3 del orden de trabajo. El formulario deja de ser una página larga: ahora
`formularioCrearReceta.tsx` es el contenedor (el `useForm`, el borrador, la foto, la llamada a la IA y
el envío) y todo lo que se rellena vive en `components/crearReceta/asistente/`.

Los pasos están declarados como datos en `asistente/pasos.ts`, no repartidos por el JSX:

| Paso | Qué pide | Campos que valida |
|---|---|---|
| `foto` | La foto, con opción de saltarla | ninguno |
| `datos` | Título, descripción, tiempo, porciones, dificultad y tipo de receta | `titulo`, `descripcion`, `tiempo`, `unidadTiempo`, `porciones`, `dificultad`, `dietas` |
| `ingredientes` | `SeccionIngredientes`, la misma que usa editar | `ingredientes` |
| `pasos` | `SeccionPasos`, la misma que usa editar | `pasos` |
| `alergenos` | Lo que ha detectado de los ingredientes | ninguno |

`useAsistenteCrearReceta(trigger)` guarda el índice y expone `siguiente`, `atras` e `irAPaso`.
«Siguiente» llama a `trigger(paso.campos, { shouldFocus: true })` y solo avanza si ese bloque está
bien; los pasos sin campos pasan siempre. Recibe el `trigger` por parámetro en vez de leer el
contexto porque quien lo necesita es el contenedor, que está por fuera del `FormProvider` y no puede
usar `useFormContext`.

**Volver atrás no borra nada.** El estado vive en react-hook-form, no en los componentes de cada
paso, y `shouldUnregister` está en su valor por defecto (`false`), así que desmontar el bloque no
descarta sus valores. El borrador se sigue guardando a los 600 ms de la última tecla, se pinte el
paso que se pinte.

**Un solo diálogo, tres vistas.** `AsistenteCrearReceta` alterna entre `pasos`, `ia` y `salir` dentro
del mismo `Dialog`. Abrir un Radix encima de otro encadena dos trampas de foco y deja teclado y
lectores de pantalla en tierra de nadie, así que el atajo de IA y la confirmación de borrar son
vistas, no diálogos. `Escape` desde una vista secundaria vuelve a los pasos en lugar de cerrar, y
`onInteractOutside` está anulado: con un formulario a medias, un clic fuera no puede cerrar nada.

**El atajo de IA avisa antes de pisar lo escrito.** `VistaGenerarIa` comprueba `hayContenido()` antes
de generar; si hay algo, el botón pasa a «Sustituir y generar» y enseña de qué va la sustitución. Al
volver la receta generada, el contenedor hace `reset({ ...VALORES_INICIALES, ...generado })` (mezclar
es obligatorio: si `ingredientes` o `pasos` llegan sin definir, `useFieldArray` se queda sin filas) y
manda al paso de datos, para que se vea lo que ha rellenado.

**El carrusel `TutorialCrearReceta` ya no existe.** Sus tres consejos son ahora la línea de ayuda del
paso al que pertenecen: la foto con luz natural en `foto`, la cantidad con unidad en `ingredientes` y
el aviso de que la pantalla siguiente es la revisión en `alergenos`. `PopUpTutorial` se queda como
bienvenida de una sola vez y abre el asistente, tanto si se acepta como si se salta.

**`PopUpError` sale de crear.** Cuando el envío final no valida, `pasoConPrimerError()` mira los
errores contra los campos de cada paso y el asistente salta al primero que falla, que es donde está
el mensaje. El pop-up sigue vivo para `editarReceta`, que todavía es una página larga.

Detrás del diálogo, la página de crear enseña un panel con el botón de abrir el asistente («Empezar
la receta» o «Seguir con la receta» si hay borrador) y el atajo de IA, que abre el diálogo
directamente en esa vista. El fondo atenuado no hay que inventarlo: la foto y su capa oscura ya
estaban en `/crear-receta`.

De accesibilidad, lo que hay hoy: el título de cada paso es un `<h2 tabIndex={-1}>` que recibe el
foco al cambiar de paso, con un `sr-only` «Paso X de N» delante para que el lector anuncie dónde
está. Va con `DialogTitle asChild` porque los envoltorios de shadcn v4 son funciones sin `forwardRef`
y en React 18 una `ref` puesta encima llega vacía. El indicador de progreso visual y el
`aria-current="step"` son el punto 5.

### El diálogo partido en escritorio, hecho el 18/09/2026

El punto 4. A partir de `lg` (1024 px) el diálogo se ensancha a `max-w-5xl` y se parte en dos: los
campos del paso a la izquierda, `VistaPreviaPaso` a la derecha bajo un «Así se verá». Por debajo de
esa anchura la columna derecha no existe (`hidden lg:flex`), no se apila: el paso ya ocupa la
pantalla entera y una previsualización debajo obligaría a bajar para ver lo que acabas de escribir.

`VistaPreviaPaso` reutiliza los bloques de `previsualizacion/` y los alimenta con un `useWatch` de
los nueve campos, así que se actualiza mientras escribes sin pasar por el store ni por
`/crear-receta/revisar`. Enseña solo el bloque del paso en el que estás; en el de alérgenos, cuando
no hay ninguno, lo dice en vez de quedarse en blanco.

Dos cosas que hubo que tocar en los bloques para que aguanten un formulario a medias:
`MetaPrevisualizacion` pinta cada píldora solo si su número es finito y mayor que cero (con
`valueAsNumber`, un campo vacío es `NaN`, y `NaN &&` acaba pintando «NaN» en pantalla) y la
dificultad de `CabeceraPrevisualizacion` pasa a ser opcional. En `/crear-receta/revisar` los tres
valores están siempre validados, así que allí no cambia nada.

La columna es un `aria-live="polite"` y no tiene nada enfocable dentro: no se le pasan los huecos de
manos libres ni el crédito de Pexels, así que el tabulador va de campo a campo y no se mete en un
escaparate que no se puede tocar.

### Los pasos a pantalla completa, hecho el 18/09/2026

El punto 5, y con él se cierra el asistente. Por debajo de `lg` el diálogo ocupa la pantalla entera
(`h-dvh w-screen`, sin esquinas redondeadas) y solo a partir de 1024 px vuelve a ser una ventana
centrada. En un móvil, un diálogo con márgenes deja al teclado virtual comiéndose media receta; a
pantalla completa el campo que estás rellenando se queda donde debe. La barra de botones lleva
`env(safe-area-inset-bottom)` para no quedar debajo de la barra de gestos del iPhone.

El progreso es un `<ol>` de cinco barras en la cabecera. El paso actual va marcado con
`aria-current="step"` y los pasos ya pasados son botones que vuelven a ellos, porque volver atrás no
valida ni borra nada; los que quedan por delante son texto y no se pueden saltar. El nombre de cada
paso va en un `sr-only`, así que quien navega a ciegas oye «Paso 3 de 5» al llegar y puede repasar la
lista sin depender del color de las barras.

### El repaso en navegador, hecho el 18/09/2026

Con los cinco puntos cerrados, el asistente se probó a mano en Chrome contra el backend aislado de
los E2E (Mongo efímero en el 27018, nunca Atlas), a 1440 px y a 390 px. Salieron tres cosas que
ninguna comprobación automática iba a ver:

- **El selector de unidad de tiempo se salía de su celda.** El `input` de tiempo es `flex-1` y un
  campo numérico no baja de su ancho intrínseco, así que en la columna estrecha del diálogo empujaba
  al `select` encima del campo de porciones. Un `min-w-0` lo arregla; en el formulario ancho de antes
  el problema no se veía porque sobraba sitio.
- **Los pasos ya hechos de la barra de progreso eran invisibles.** `bg-brand/40` no pinta nada:
  Tailwind 3 descarta el modificador de opacidad cuando el color es un `var(--brand)` con un valor
  completo, y no llega a generar la clase. El indicador pasa a `bg-brand-muted`, y el resto de fondos
  suaves del asistente a `bg-brand-subtle`, que son tokens reales del tema y existen en claro y en
  oscuro.
- **El botón de IA se quedaba mudo en móvil.** Su texto es `hidden sm:inline`, y `display: none` no
  cuenta para el nombre accesible, así que por debajo de 640 px era un botón sin nombre. Lleva
  `aria-label` fijo.

Lo demás respondió: el borrador se recupera y se puede tirar, `Atrás` no borra nada (los pasos se
desmontan pero `shouldUnregister` está en `false`), la validación por paso frena y enfoca el campo
que falla, la confirmación de la IA aparece cuando ya hay algo escrito y `/crear-receta/revisar` sigue
recibiendo los datos igual que antes.

Queda una cosa sin resolver, y es más grande que este formulario: **el modificador de opacidad sobre
`brand` no funciona en ninguna parte de la aplicación**. Son 104 clases repartidas por todo `src/`:
54 `bg-brand/*`, 18 `ring-brand/*`, 16 `border-brand/*` y el resto entre texto y degradados. La
mayoría solo se queda sin pintar, pero los 18 `focus:ring-brand/40` tienen consecuencia visible: como
`ring-2` sí se aplica y `ring-brand/40` no, el anillo de foco de todos los campos sale con el azul de
fábrica de Tailwind (`#3b82f680`) en lugar del naranja de la marca. Se arregla de raíz cambiando el
tema (guardar los colores por canales, o pasar a Tailwind 4, que resuelve esto con `color-mix`), y
eso toca pantallas que no son esta.

### Lo que salió de enseñárselo a alguien, el 19/09/2026

El asistente se probó ya terminado, en Chrome y a 390 px, y salieron cuatro cosas. Tres son de
criterio y una es un fallo de verdad.

**El diálogo de bienvenida manda, no el tutorial.** Había dos pantallas peleándose por ser la
primera: un pop-up de «¿Es tu primera receta?» con tres consejos genéricos para quien no tenía
ninguna publicada, y la apertura automática del asistente para quien sí. Las dos desaparecen. Al
entrar en `/crear-receta` ahora se ve siempre la tarjeta de bienvenida, con «Empezar la receta» y
«Crear desde descripción (IA)» al mismo nivel, y si hay borrador guardado cambia el título a «Tienes
una receta a medias». Abrir el asistente solo porque sí se lleva por delante la otra mitad de la
pantalla, que es la entrada por IA; el consejo de poner una foto apetecible lo da mejor el propio
paso de la foto. Con el pop-up se fueron `popUpTutorial.tsx` y la llamada a `useMisRecetas` que lo
alimentaba, así que la página ya no espera a que cargue la lista de recetas para decidir qué enseñar.

**«Borrar y salir» era gris sobre gris.** El botón vivía en la barra inferior como texto suelto y
competía de menos con «Siguiente», hasta el punto de que hay que buscarlo. Pasa a borde y texto en
`destructive`, con relleno rojo y texto blanco al pasar por encima. De paso salió el mismo problema
del tema que ya documentamos con `brand`: `hover:bg-destructive/90` no generaba ninguna regla, y
`text-destructive-foreground` era todavía peor, porque ese token **no está definido** en
`tailwind.config.ts`. El botón de confirmar del paso de salida llevaba las dos clases muertas a la
vez: rojo invisible y texto invisible. Ahora son `bg-destructive`, `text-white` y `hover:opacity-90`.

**El repaso enseña la foto y los macros.** La previsualización final ya montaba la imagen de fondo,
pero el panel nutricional era un marcador de posición con guiones y la frase «se calculará al
publicar». Los macros los calculaba `nutritionService` (Edamam primero, USDA de reserva) y solo
existían dentro de `recetaRepository`, en el momento de publicar, así que quien revisaba no tenía
manera de ver si su receta salía en 300 kcal o en 900. Se abre `POST /api/recetas/macros-preview`:
recibe la lista de ingredientes, convierte la cantidad de texto a número (`"250"` → `250`, `"al
gusto"` → `0`) y devuelve los mismos macros que se guardarán, sin tocar la base de datos. Lleva
`requerirAuth`, `limitarPorUsuario(20)` porque gasta cuota de API externa, y un tope de 50
ingredientes. En el frontend es `useMacrosPreview`, con `staleTime` de cinco minutos y la lista de
ingredientes en la `queryKey`, de modo que volver atrás y adelante en el asistente no vuelve a
pedirlo. El panel distingue tres estados: calculando, estimación real, y «no hemos podido estimarla
ahora», que es lo que se ve si faltan las claves de Edamam y USDA.

**No se podía adjuntar una foto.** Este era el fallo, y no estaba en el formulario: `POST
/api/subidas/firma` respondía 503 «El almacenamiento de imágenes no está configurado». El backend
contra el que se estaba probando es el de los E2E, que a propósito no lee `backend/.env` para que
ninguna prueba gaste cuota ni escriba en Atlas. Sin `CLOUDINARY_URL` no hay firma, sin firma el
navegador no puede subir nada a Cloudinary y el paso de la foto se queda mudo. La subida de
producción nunca estuvo rota.

Para no volver a confundir un entorno de pruebas con un fallo de la aplicación, hay un tercer
servidor: `npm run pruebas:ui` (`backend/scripts/servidorPruebasUI.js`). Mantiene el Mongo efímero en
el 27018, y de `backend/.env` toma **solo** las claves de servicios externos —Cloudinary, Pexels,
Edamam, USDA, Gemini y `GOOGLE_CLIENT_ID`—, nunca `MONGODB_URI` ni las de Mailjet; si alguna de esas
tres está exportada en el entorno, el proceso se niega a arrancar. Sirve el `dist/`, así que hay que
hacer `npm run build` antes. Gasta cuota real: es para probar a mano, no para el CI.

Dos avisos si lo usas. Arranca con `NODE_ENV=development`, así que el login exige el correo
verificado y no hay Mailjet para mandarlo: la cuenta de prueba se marca a mano con
`cuentaVerificada: true` en el Mongo efímero. Y las fotos que subas acaban en el Cloudinary de
verdad, en `cookr/recetas/`, sin ninguna receta que las apunte si no llegas a publicar.

### El E2E, de vuelta a verde el 25/09/2026

Quitar el pop-up de tutorial rompió el E2E del flujo principal y nadie se enteró, porque el job `e2e`
no bloquea el despliegue. `rellenarReceta` empezaba pulsando «Saltar tutorial», un botón que desde el
commit 37e6314 no existe, y el test se quedaba esperándolo hasta agotar el tiempo.

Ahora entra por la tarjeta de bienvenida, igual que una persona. El nombre del botón cambia según haya
borrador o no, así que el locator acepta los dos: `/^(Empezar|Seguir con) la receta$/`. Un navegador
recién abierto por Playwright nunca tiene borrador, pero si algún día el test reutiliza contexto o
alguien añade un paso que recarga la página a medias, el texto pasa a «Seguir con la receta» y no
queremos que eso lo tumbe. Del asistente en adelante no cambia nada: los cinco pasos, «Siguiente» y
«Revisar receta» son los mismos que antes.

En el repaso, el panel nutricional sale con «No hemos podido estimarla ahora», porque
`servidorE2E.js` no tiene claves de Edamam ni USDA. Es lo esperado y ningún test lo comprueba.

La lección es incómoda: un E2E que no bloquea nada solo sirve si alguien lo mira. Cualquier cambio en
la entrada de `/crear-receta` pide lanzar `npm run e2e` antes del commit.

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
2. ~~Partir la previsualización por bloques, sin duplicar el maquetado ni tocar lo que enseña
   `/crear-receta/revisar`.~~ **Hecho el 18/09/2026**, detallado en «La previsualización, partida por
   bloques».
3. ~~El armazón del asistente: estado del paso, navegación adelante y atrás, validación **por bloque**
   con `trigger` de los campos de ese paso.~~ **Hecho el 18/09/2026**, detallado en «El armazón del
   asistente».
4. ~~El diálogo de escritorio partido en dos, con la previsualización del bloque alimentada por
   `useWatch`, `aria-live="polite"` y fuera del orden de tabulación.~~ **Hecho el 18/09/2026**,
   detallado en «El diálogo partido en escritorio».
5. ~~Los pasos en móvil a pantalla completa, con el indicador de progreso y `aria-current="step"`.~~
   **Hecho el 18/09/2026**, detallado en «Los pasos a pantalla completa».

Del 2 al 5 el orden importa. El 2 es útil por sí solo aunque el asistente se quede a medias.

**Los cinco puntos están hechos.** Lo que queda es mirarlo con usuarios: «Qué medir después», aquí
abajo.

El atajo de IA y el tutorial de la primera vez entran en el punto 3, y cómo entran está resuelto en
«Dos decisiones que el asistente obliga a tomar», más arriba.

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
