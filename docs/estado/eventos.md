# Eventos semanales y mensuales

Cookr enseña hoy un evento que no existe. Este documento dice qué hay exactamente, por qué no
funciona, y cómo convertirlo en una funcionalidad de verdad sin montar infraestructura nueva.

---

## Lo que hay ahora mismo

### En la base de datos

`recetaMongo.ts:59` tiene un booleano suelto:

```ts
esEvento: { type: Boolean, default: false },
```

Sin fecha, sin nombre de evento, sin principio ni final. Una receta «es evento» para siempre. Hay un
índice `{ esEvento: 1, fechaPublicacion: -1 }` y un test que lo comprueba (`feed.indices.test.ts:104`).

Consultado contra Atlas el 18/09/2026, de **143 recetas hay 6 marcadas**, todas puestas por los seeds:

| Receta | Publicada | Categorías |
|---|---|---|
| Solomillo Wellington | 04/06/2026 | altoEnProteinas |
| Arroz Caldoso de Bogavante | 02/06/2026 | mediterranea, española |
| Cordero al Romero con Patatas | 23/05/2026 | mediterranea, altoEnProteinas |
| Pulpo a la Gallega | 28/04/2026 | española, mediterranea, altoEnProteinas |
| Cocido Madrileño | 07/04/2026 | española |
| Paella de Marisco | 25/03/2026 | mediterranea, española |

Son platos de celebración, puestos a mano en `seedMasivo.ts` y `seedCompleto.ts`. Ningún usuario puede
marcar una receta como de evento: no hay campo en el formulario ni en la API.

### En la interfaz

`contenidoDiscover.tsx:98` pinta una tarjeta destacada con esto, escrito a fuego en el frontend:

```ts
export const EVENTO_DESTACADO_MOCK: EventoDestacado = {
  titulo: 'Semana de la Cocina Mediterránea',
  subtitulo: 'Recetas frescas, saludables y llenas de sabor',
  etiqueta: 'Especial de la semana',
}
```

La tarjeta **no es pulsable**. No lleva a ningún sitio, no tiene relación con las 6 recetas marcadas
(solo 3 llevan la categoría `mediterranea`) y lleva diciendo «Especial de la semana» desde que se
escribió. La pestaña «Especiales Evento» sí funciona: manda `soloEvento=true` y devuelve esas 6.

Así que hay dos mitades que no se hablan. Una tarjeta que anuncia un evento inventado y un filtro que
devuelve seis recetas que no pertenecen a ese evento ni a ninguno.

---

## Qué debería ser

Un evento es un periodo con nombre durante el cual Cookr destaca un tipo de cocina e invita a publicar.
Dos cadencias:

- **Semanal.** De lunes a domingo. Algo ligero y concreto: «Cenas en 20 minutos», «Semana del arroz»,
  «Aprovecha lo que te sobra».
- **Mensual.** Más ambicioso y ligado al calendario real: «Recetas de otoño», «Navidad sin gluten»,
  «Menús de vuelta al cole».

Las dos pueden estar activas a la vez, y eso está bien: una receta puede entrar en las dos.

Lo que convierte esto de una estantería en una funcionalidad social es que **el usuario pueda
participar**. No basta con que alguien etiquete seis recetas antiguas: al crear una receta mientras hay
un evento abierto, se ofrece apuntarla. Eso da una razón para publicar, que es justo lo que le falta a
una red social pequeña.

---

## Modelo de datos

Una colección nueva, `eventos`:

```ts
{
  slug: string            // 'semana-del-arroz', único, es la URL
  titulo: string
  subtitulo: string
  etiqueta: string        // 'Especial de la semana' | 'Especial del mes'
  tipo: 'semanal' | 'mensual'
  inicio: Date
  fin: Date
  imagenUrl?: string
  criterio: {
    categorias?: string[]   // inclusión automática por categoría
    recetaIds?: ObjectId[]  // recetas escogidas a mano
  }
  activo: boolean         // interruptor manual para cancelar uno sin borrarlo
}
```

Índice `{ inicio: 1, fin: 1 }` más `{ slug: 1 }` único.

Y en `recetas`, un campo nuevo:

```ts
eventos: [{ type: Schema.Types.ObjectId, ref: 'Evento', index: true }]
```

Un array, porque una receta puede estar en el semanal y en el mensual a la vez.

**`esEvento` se queda.** Se mantiene al escribir como `eventos.length > 0`. Cuesta una línea en el
repositorio y con eso el índice existente, el filtro `soloEvento` y los 215 tests del backend siguen
funcionando sin tocarse. Quitarlo no aporta nada y rompe cosas.

### Un aviso sobre `criterio.categorias`

Inclusión automática por categoría suena bien hasta que se mira lo que hay en Atlas. Las categorías
distintas de la colección son:

```
null, altoEnProteinas, asiática, bajoEnCalorias, desayuno, española, halal,
italiana, keto, lowCarb, mediterranea, mexicana, paleo, pasta, postres,
sin gluten (verificar ingredientes), sin lactosa, sopa, vegana, vegano,
vegetariana, vegetariano
```

Están duplicadas en singular y femenino (`vegano` y `vegana`, `vegetariano` y `vegetariana`),
`mediterranea` va sin tilde mientras `española` y `asiática` la llevan, hay un `null`, y existe una
categoría llamada literalmente `sin gluten (verificar ingredientes)`, que es un aviso de la detección
de alérgenos que se coló como etiqueta.

Un evento que diga `criterio: { categorias: ['vegano'] }` se dejará fuera todas las recetas marcadas
`vegana`. Por eso el criterio automático es **el secundario** y no el principal: lo que manda son las
recetas apuntadas a mano y las que el autor apunta al publicar. Y antes de usar categorías en serio hay
que normalizar la colección, que es un script de migración aparte.

---

## Cómo se decide cuál está activo

**Por fecha, y ya está. No hace falta ningún cron.**

```ts
const ahora = new Date()
Evento.find({ activo: true, inicio: { $lte: ahora }, fin: { $gte: ahora } })
```

Es la decisión de diseño que más trabajo ahorra. No hay tarea programada que pueda fallar, no hay
estado que se quede a medias si Render reinicia, y sembrar un año de eventos de golpe es un script que
se ejecuta una vez.

Lo que sí hay que cuidar es la zona horaria. Las semanas van de lunes a las 00:00 a domingo a las
23:59 en `Europe/Madrid`, y el servidor de Render va en UTC. Las fechas se guardan en UTC ya
convertidas desde Madrid en el momento de sembrarlas, no se calculan en tiempo de consulta.

Para crearlos, `npm run seed:eventos` con un calendario declarado en el propio script. No hay rol de
administrador en Cookr y montarlo solo para esto no compensa.

---

## API

```
GET  /api/eventos/activos          → { semanal: Evento | null, mensual: Evento | null }
GET  /api/eventos/:slug            → el evento + total de recetas
GET  /api/recetas?evento=<slug>    → feed filtrado por ese evento
POST /api/recetas                  → acepta eventos: string[] en el cuerpo
```

`GET /api/eventos/activos` es público y cacheable de sobra (`Cache-Control: public, max-age=300`): es
la misma respuesta para todo el mundo y cambia una vez por semana.

En `POST /api/recetas`, el backend **no se fía del slug que manda el cliente**. Valida que el evento
exista, que esté activo y que la fecha de hoy caiga dentro. Apuntarse a un evento cerrado o futuro no
se permite, o el primero que mire la API mete sus recetas en todos los eventos del año.

El filtro por evento se suma al resto de filtros del feed, incluido el suelo de alérgenos. Un evento no
puede enseñar a nadie una receta con un alérgeno de su perfil.

---

## Interfaz

**La tarjeta destacada** (`tarjetaDestacada.tsx`) deja de recibir el mock y recibe el evento activo. Y
pasa a ser un enlace a `/eventos/[slug]`, que es lo que hoy no hace. El componente ya está maquetado y
se ve bien, solo le falta el `<Link>` y los datos.

**Si no hay evento activo, la tarjeta no se enseña.** Ni un esqueleto eterno ni un «próximamente». Y la
pestaña «Especiales Evento» tampoco: una pestaña que devuelve cero resultados es peor que no tener
pestaña.

**`/eventos/[slug]`**, página nueva: cabecera con el título, el subtítulo, cuánto queda («termina el
domingo»), la rejilla de recetas participantes y un botón de publicar en el evento. Con la cuenta atrás
en un `<time datetime="…">` para que se lea bien con lector de pantalla.

**En `/crear-receta`**, si hay evento activo, una casilla en la sección de tipo de receta:

```
☐ Participar en «Semana del arroz» · termina el domingo
```

Desmarcada por defecto. Apuntar a alguien a un evento sin que lo pida es publicar en su nombre en un
sitio donde no quería estar.

**En la tarjeta de receta**, una insignia discreta con el nombre del evento cuando pertenezca a uno
activo. Texto además del color, que un distintivo que solo se distingue por ser naranja no vale para
quien no distingue el naranja.

---

## Lo que hace que a alguien le importe

Un evento sin consecuencia es un cartel. Dos cosas baratas que lo convierten en algo:

Dentro de la página del evento, las recetas se ordenan por «me gusta» durante la semana. Es una
clasificación sin necesidad de inventar nada: el dato ya está.

Y al cerrar, el evento no desaparece. La página queda como archivo, con la receta más votada arriba y
una etiqueta de ganadora. `GET /api/eventos` devuelve el histórico, y eso da una sección de
«Eventos anteriores» en Discover que se llena sola con el tiempo.

Avisar a la gente de que empieza uno nuevo es lo que cerraría el círculo, y para eso hacen falta
notificaciones push, que solo funcionan en una aplicación instalada. Está en
[pwa.md](pwa.md); no es un requisito para esto, es lo siguiente.

---

## Trabajo estimado

| Bloque | Tiempo |
|---|---|
| Modelo `Evento`, índices y campo `eventos` en receta | 2 h |
| Repositorio, servicio y los cuatro endpoints | 5 h |
| Validación de apuntarse (evento activo, fecha dentro) | 2 h |
| `seed:eventos` con calendario de un año | 3 h |
| Tarjeta destacada con datos reales y enlace | 2 h |
| Página `/eventos/[slug]` | 5 h |
| Casilla de participar en crear receta | 2 h |
| Insignia en la tarjeta de receta | 1 h |
| Tests de backend (activos por fecha, apuntarse fuera de plazo, filtro combinado con alérgenos) | 4 h |
| Migración de las 6 recetas marcadas a un evento de archivo | 1 h |

Unas cuatro jornadas. La migración del final es cosmética pero conviene: las 6 recetas marcadas hoy son
platos de celebración españoles, así que encajan en un evento de archivo tipo «Mesa de fiesta», con
fechas ya pasadas. Así dejan de aparecer como «evento» permanente y la pestaña deja de mentir.

Orden: modelo y endpoints primero, luego el seed, luego la tarjeta con datos reales (con eso ya deja de
haber un evento falso en producción, que es lo más urgente), y después la página y la participación.

---

## Lo que se queda fuera a propósito

Eventos creados por usuarios, patrocinados o con premios. Votaciones con jurado. Eventos privados entre
seguidores. Todo eso tiene sentido en una plataforma con gente dentro; en una con 143 recetas, no.

Lo mínimo que hay que hacer **ya**, aunque no se implemente nada más de este documento: quitar
`EVENTO_DESTACADO_MOCK` de producción. Anunciar una «Semana de la Cocina Mediterránea» que no existe,
en una tarjeta que no se puede pulsar, es la clase de detalle que se nota en una demo.
