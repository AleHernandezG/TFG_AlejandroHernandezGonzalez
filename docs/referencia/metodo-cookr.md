# Qué adoptar del método de DietMetric

`docs/historico/metodo-dietmetric.md` describe cómo está montado DietMetric para trabajar con Claude Code. Este
documento decide qué de aquello tiene sentido en Cookr, qué hay que adaptar y qué no vale la pena.

El criterio para decidir es uno solo: **Cookr es un TFG con unas trece jornadas de trabajo técnico
pendiente** (`docs/estado/plan-2026-09.md`). Cualquier andamiaje que cueste más de lo que ahorre en ese plazo
sobra, por bien pensado que esté. DietMetric es un proyecto largo con un dominio que exige
exactitud numérica; Cookr no.

---

## De dónde partimos

DietMetric monta siete capas. Cookr tiene dos y media.

| Capa | DietMetric | Cookr hoy |
|---|---|---|
| Contrato corto | `CLAUDE.md` con enrutador y glosario | `CLAUDE.md`, bueno pero sin enrutador y con tres rutas rotas |
| Procedimientos | 10 skills | 3 skills |
| Revisores | 4 subagentes de solo lectura en sonnet | ninguno |
| Barreras | 3 hooks | ninguno |
| Tests de reglas | pureza, vocabulario, paridad | ninguno |
| Entradas selladas | `referencia/` con SHA-256 | ninguna |
| Historia | ADR numerados y diario | ninguna |

El `CLAUDE.md` de Cookr no es peor que el de DietMetric. En algunas cosas es mejor: explica el
doble token, el filtro de alérgenos y por qué el correo va por HTTP con un nivel de detalle que se
agradece. Lo que le falta es todo lo que hay **debajo**.

---

## Lo que se adopta

### 1 · Hooks · el mayor rendimiento por hora invertida

Es lo primero que montaría, y no está montado.

La idea de DietMetric no es «automatizar cosas». Es que **lo que se puede comprobar sin un modelo
lo compruebe algo determinista**, y que el mensaje de bloqueo diga qué hacer en lugar de solo
decir que no. Su `proteger-referencia.mjs` no responde «prohibido»: responde «`referencia/` no se
toca; si el cambio es deliberado, documéntalo en un ADR y regenera `sellos.sha256` en el mismo
commit».

Para Cookr, tres hooks, en `.claude/settings.json` (que va a git, no en `settings.local.json`):

**PreToolUse sobre `Write|Edit`, un guardián de rutas.** Cookr tiene tres carpetas dentro del
repositorio que no le pertenecen (hallazgo B6):

| Patrón | Razón que devuelve el hook |
|---|---|
| `TFG-DOcumenatacion/` | Es otro repositorio de git. Trabaja ahí desde su propia carpeta, no desde este repo |
| `ODCUTGF/` | Documentos oficiales del TFG firmados. No se editan desde código |
| `docs/diseno/stitch/`, `docs/historico/fases/`, `docs/historico/cambios/` | Material histórico. Si algo hay que actualizar, va en un documento nuevo con fecha |
| `.env`, `.env.local` | Nunca. Los cambios de entorno van a `.env.example` y a Render o Vercel |

El de `.env` es el que de verdad importa: es la diferencia entre un descuido y un secreto en el
historial.

**PostToolUse sobre `Write|Edit`, formateo.** Prettier sobre el fichero tocado, con
`npx --no-install` y tragándose cualquier error. Copiado casi tal cual de `formatear.mjs`. Ahorra
las rondas de «esto está mal indentado».

**Stop, los tests del backend.** Con la guarda que hace usable el hook de DietMetric: salir con 0
si `stop_hook_active`, si no hay cambios en `backend/src` según `git status --porcelain`, o si no
existe el script. Los 80 tests tardan 41 segundos, así que con `timeout: 180` cabe de sobra.

Cierra el hueco que el propio documento de DietMetric reconoce en la sección 11: sus hooks solo
corren en la máquina de quien programa. En Cookr el CI ya cubre esa parte, así que las dos mitades
encajan.

**Coste:** dos o tres horas los tres. **Ahorro:** cada vez que se evita tocar el repositorio
equivocado o descubrir un test roto en el CI en vez de en local.

### 2 · Tests que vigilan las reglas

Es la pieza que más falta hace en Cookr, y la auditoría lo demuestra sola: `CLAUDE.md` dice desde
julio que la validación Zod va en la ruta, y hoy la cumple un router de seis (hallazgo M1). La
regla estaba escrita, era correcta y nadie la miró.

DietMetric tiene `pureza.test.ts` (que ninguna capa importe lo que no debe) y `vocabulario.test.ts`
(que los nombres del dominio sean los del glosario). En Cookr los equivalentes son cuatro, y ya
están en el plan como F9.2:

- Que todo endpoint con cuerpo pase por `validarBody`.
- Que ningún fichero de `services/` importe de `models/`.
- Que el catálogo de alérgenos del frontend y el del backend sean el mismo.
- Que toda variable leída con `process.env` en `src/` esté en `.env.example` (esto solo habría
  evitado los hallazgos M3 y M4 enteros).

Un test que falla es incontestable. Un documento que dice lo mismo se ignora durante siete
semanas.

**Coste:** una jornada. Es la mejor jornada del plan.

### 3 · Enrutador de lectura en `CLAUDE.md`

DietMetric abre su `CLAUDE.md` con una tabla de «a qué vienes → qué leer». Cookr no tiene nada
parecido, y encima manda a tres carpetas que no existen (hallazgo B4).

Con `docs/README.md` ya escrito, la versión corta en `CLAUDE.md` son seis filas: tocar un
endpoint, tocar el feed, tocar autenticación, desplegar, escribir tests, escribir la memoria.

**Coste:** una hora. Se hace junto con F10.1.

### 4 · ADR y diario

Las dos reglas de DietMetric sobre los ADR son las que los hacen útiles, y las dos son fáciles de
saltarse si no se escriben:

- **Un ADR aceptado no se edita.** Si la decisión cambia, se escribe otro que lo sustituya y el
  viejo queda enlazado. Así hay historia y no una foto del presente.
- **Las consecuencias negativas no pueden estar vacías.** Si no encuentras qué cuesta una
  decisión, no has entendido la alternativa que descartaste.

Cookr tiene cinco decisiones ya tomadas que hoy solo viven explicadas en `CLAUDE.md`: Mailjet por
HTTP, alérgenos en el backend, doble token, E2E fuera del bloqueo del deploy, y Redis con respaldo
en memoria. `CLAUDE.md` explica **qué** hay que hacer; el ADR explica **qué se descartó y qué
costó**, que es la pregunta que vuelve.

Para un TFG hay un motivo extra: la memoria pide justificar decisiones de diseño. Cinco ADR bien
escritos son cinco secciones de la memoria a medio redactar.

El diario, más simple que el de DietMetric: `docs/estado/diario.md`, una entrada por sesión de trabajo,
con qué se hizo, qué decisión costó y qué queda a medias. Su versión son cinco apartados por
paquete cerrado; aquí con tres líneas basta. Lo importante no es el formato, es que la sesión de
dentro de tres semanas no reconstruya el razonamiento desde el `git log`.

**Coste:** media jornada las cinco fichas, cinco minutos por entrada de diario.

### 5 · Un subagente revisor de capas

Su `revisor-capas.md` es de solo lectura, corre en sonnet y termina con «si no encuentras nada,
dilo claro y no inventes hallazgos menores». Ese cierre importa: sin él, un revisor siempre
encuentra algo.

En Cookr el equivalente comprueba lo que dice `CLAUDE.md`: Zod en la ruta y no en el controlador,
`requerirAuth` en la ruta, repositorios como único sitio que toca Mongoose, servicios que lanzan
errores con `status` embebido, y la unión de alérgenos en cualquier vía nueva que devuelva
recetas.

Con `tools: Read, Grep, Glob` y `model: sonnet`: es barato y no toca nada.

Vale la pena **después** de F8.1, cuando el código ya cumpla la regla. Antes, el revisor
encontraría 29 endpoints incumpliendo y sería ruido.

**Coste:** una hora.

### 6 · Skills de lo que se repite

Las tres de Cookr están bien planteadas, pero `cookr-memoria` apunta a `documentacion/` y
`overleaf/`, que no existen aquí (B4). Eso hay que arreglarlo antes que añadir ninguna.

Después, la que falta de verdad es una de frontend: crear una feature completa con su hook de
TanStack Query, su servicio, la cabecera `Authorization` a mano (que es donde se falla, porque
`apiClient` no tiene interceptor) y la entrada en el `matcher` del middleware si la página pide
sesión. Es el procedimiento más repetido del proyecto y el que más trampas tiene.

Una segunda, de despliegue, con lo que hay hoy repartido entre `REVISION_DESPLIEGUE.md` y el
workflow del CI.

Y nada más. DietMetric avisa en su sección 12: no te lleves sus diez skills. La cifra no es la
meta.

**Coste:** dos o tres horas.

### 7 · Permisos y plugins

DietMetric reconoce que no tiene lista de permisos y que cada `npm test` pide confirmación. Cookr
está igual. Es el arreglo más barato de todos: permitir `npm test`, `npm run lint`, `npx tsc`,
`git status` y `git diff` en `.claude/settings.local.json`.

De los siete plugins que tienen habilitados, aquí encajan `typescript-lsp` (los dos paquetes son
TypeScript), `context7` (documentación real de Next 14, Mongoose y NextAuth, que es exactamente
donde un modelo se equivoca con una API vieja) y `commit-commands`. Los de Rust y Python sobran.

**Coste:** veinte minutos.

---

## Lo que se adapta a medias

### Entradas congeladas

Es, dicen ellos, «el patrón que más veces salva el proyecto». En DietMetric hay libros de Excel y
patrones oro sellados con SHA-256 porque el dominio es nutrición clínica: si el fichero contra el
que validas cambia sin que nadie se entere, los resultados dejan de significar nada.

Cookr no tiene nada parecido. Sellar el dataset de `seed:completo` sería ceremonia sin motivo.

Pero la pregunta que hay detrás sí se traslada: **¿qué fichero define aquí lo que está bien?** Hay
uno, y es el catálogo de alérgenos (hallazgo M2). Hoy no existe: son cadenas de texto libre en
Mongo comparadas por igualdad. Ese catálogo, cuando se escriba en F8.2, es lo más parecido a una
entrada congelada que tiene el proyecto, y merece su test y su hook de protección. Sin SHA-256.

### Documentación en dos versiones

`docs/tecnica/` para quien va a tocar el código y `docs/aprende/` para quien empieza. Ellos mismos
lo condicionan: «solo si tu proyecto tiene de verdad dos lectores».

Cookr los tiene, pero no aquí. El lector que no conoce el proyecto es el tribunal, y lee la memoria
en LaTeX, que vive en `TFG-DOcumenatacion/`. Duplicar la explicación en `docs/` sería mantener dos
veces lo mismo con dos formatos.

Lo que sí conviene: cuando `docs/` explique bien algo, que la memoria lo cite en lugar de
reescribirlo con otras palabras.

---

## Lo que no se lleva

- **Los sellos SHA-256 y el hook de paridad.** Sin patrón oro que proteger, es maquinaria vacía.
- **El plan de 23 paquetes con fichas.** `docs/estado/plan-2026-09.md` ya es eso con la granularidad que pide
  un proyecto de trece jornadas. La forma sí, el tamaño no.
- **La regla que prohíbe al modelo hacer commit.** Es una preferencia suya, no una mejora.
- **Las diez skills.** El contenido es de nutrición, Excel y Tauri.
- **Los cuatro subagentes.** Con uno basta. Cuatro revisores en un proyecto de este tamaño es
  revisar más de lo que se escribe.
- **`docs/aprende/`**, por lo dicho arriba.

---

## En qué orden

Nada de esto arregla un fallo. `docs/estado/plan-2026-09.md` pone el bloque de método el último a propósito, y
dentro del bloque el orden es este:

| Orden | Qué | Coste | Por qué ahí |
|---|---|---|---|
| 1 | Permisos y plugins | 20 min | Deja de interrumpir desde la primera sesión |
| 2 | Hook de rutas protegidas | 1 h | Evita tocar el repositorio equivocado o un `.env` |
| 3 | Enrutador en `CLAUDE.md` y rutas rotas | 1 h | Va con F10.1 |
| 4 | Los cuatro tests de reglas | 1 jornada | Es F9.2. Lo que impide que la auditoría de dentro de dos meses encuentre lo mismo |
| 5 | Hooks de formateo y de tests | 1 h | Cómodo, no urgente |
| 6 | Cinco ADR y el diario | media jornada | Sirve dos veces: al proyecto y a la memoria |
| 7 | Subagente revisor | 1 h | Después de F8.1, no antes |
| 8 | Dos skills nuevas | 3 h | Cuando el procedimiento que documentan ya sea el definitivo |

Los puntos 1 a 3 se hacen en una mañana y se notan al día siguiente. El 4 es el que evita que esta
auditoría haya que repetirla.
