# Método de trabajo con Claude Code

Este documento no explica DietMetric. Explica **cómo se trabaja en DietMetric con Claude Code**:
qué piezas hay montadas, para qué sirve cada una, por qué está así y qué te llevarías a otro
proyecto.

Está escrito para copiarse. Cada apartado termina diciendo qué es específico de aquí y qué es
portable tal cual.

La idea de fondo cabe en una frase: **una regla que nadie comprueba es una sugerencia**. Todo lo
que hay montado existe para convertir reglas en algo que se ejecuta, o para que la sesión no tenga
que recordar lo que ya está escrito.

---

## 1. Las capas, de un vistazo

| Capa | Dónde vive | Qué garantiza | Quién la ejecuta |
|---|---|---|---|
| Contrato | `CLAUDE.md` del proyecto y el global | Las reglas que no se negocian | El modelo, leyéndolo en cada sesión |
| Procedimientos | `.claude/skills/` | Que una tarea recurrente se haga igual la vez 20 que la 1 | El modelo, cuando la invoca |
| Revisión | `.claude/agents/` | Un dictamen independiente sin gastar el contexto principal | Un subagente |
| Barreras | `.claude/hooks/` | Que lo prohibido no llegue a pasar | Node, fuera del modelo |
| Pruebas que vigilan reglas | `packages/*/tests/` | Que la arquitectura no se erosione en silencio | Vitest y cargo |
| Contratos congelados | `docs/tecnica/` | Que la respuesta se escriba una vez | Una persona |
| Historia | `docs/tecnica/adr/`, `docs/aprende/diario/` | Que nadie deshaga una decisión sin saber qué resolvía | Una persona |

Las cuatro primeras son la parte automatizable, y son las que se copian sin pensar. Las tres
últimas son documentación, y son las que de verdad ahorran trabajo a largo plazo.

---

## 2. `CLAUDE.md`: el contrato corto

Hay dos, y hacen cosas distintas.

**El global** (`~/.claude/CLAUDE.md`) lleva lo que vale para todos los proyectos: idioma de la
documentación y de los commits, prohibición de comentarios en el código, la lista negra de palabras
de chatbot, el estilo de los mensajes de commit.

**El del proyecto** (`CLAUDE.md` en la raíz) lleva lo que solo vale aquí. Tiene cinco bloques y
merece la pena mirar la forma, no el contenido:

1. Una tabla de «qué leer antes de tocar nada», con el fichero y qué te da cada uno. Es un
   enrutador, no un resumen.
2. Cinco reglas obligatorias numeradas, cada una con su consecuencia. La 1 prohíbe cambiar una
   fórmula del prototipo sin permiso; la 4 prohíbe que el modelo escriba en el historial de git.
3. Las reglas del proyecto: el dominio es puro, la tolerancia es 0,01, `referencia/` es de solo
   lectura, un alérgeno sin dato no es un alérgeno ausente.
4. El estilo, que repite lo mínimo del global y añade lo de aquí.
5. Un glosario de dominio en tabla: término en castellano, nombre en código, significado.

**Por qué funciona el glosario.** Sin él aparecen tres nombres para lo mismo, y eso no es un
problema de estética: es lo más caro de deshacer cuando ya hay veinte ficheros importando el nombre
equivocado. Aquí «rotación» es `rotation`, «ingesta» es `mealType` y «cliente» es `patient` porque
la interfaz dice cliente y el esquema dice paciente. Una tabla de veinte filas evita todas esas
discusiones.

**Lo que no va en `CLAUDE.md`.** Procedimientos largos. Si algo ocupa más de un párrafo y solo hace
falta cuando se hace esa tarea concreta, es una skill. El `CLAUDE.md` se lee entero en cada sesión;
todo lo que metas ahí lo pagas siempre, se use o no.

**Portable:** la forma entera. Cambia el contenido, quédate con la estructura de tabla de lectura,
reglas numeradas y glosario.

---

## 3. Skills

Una skill es un procedimiento escrito que el modelo carga **solo cuando hace falta**. Vive en
`.claude/skills/<nombre>/SKILL.md` con una cabecera YAML de dos campos:

```markdown
---
name: paridad-excel
description: Valida que un cálculo de la app da el mismo resultado que el prototipo de Excel.
             Úsala al portar cualquier fórmula, al cerrar una fase, o cuando un test de paridad
             falla y hay que decidir si es un bug o una divergencia esperada.
---
```

La `description` es lo único que se carga siempre. Por eso está escrita como un disparador: dice
qué hace y **en qué situaciones concretas se usa**. Una descripción vaga es una skill que nunca se
invoca.

### Las diez de este proyecto

| Skill | Cuándo se dispara | Qué evita |
|---|---|---|
| `adr` | Al elegir entre alternativas técnicas o aceptar una desviación | Que dentro de un año alguien deshaga una decisión sin saber qué resolvía |
| `regla-de-negocio` | Al portar una fórmula del Excel al dominio | Traducir una fórmula sin seguir sus dependencias ni buscar la fuente científica |
| `paridad-excel` | Al validar un cálculo contra el patrón oro | Subir la tolerancia para que pase un test, que es el fallo clásico |
| `dominio-puro` | Al añadir cálculo, tipos u objetos de valor al núcleo | Que se cuele una dependencia y el dominio deje de ser ejecutable en cualquier sitio |
| `comando-tauri` | Al crear o cambiar un punto de entrada entre React y Rust | Exponer structs de base de datos, olvidar la transacción, no regenerar los bindings |
| `migracion-bd` | Al tocar el esquema de SQLite | Editar una migración ya aplicada, que deja la base del usuario en un estado que el código no reconoce |
| `vista-react` | Al montar una pantalla | Meter en Zustand lo que ya gestiona TanStack Query, o renderizar 973 filas sin virtualizar |
| `etl-excel` | Al extraer datos de los libros congelados | Leer la TCA con la cabecera desplazada y no enterarte hasta mucho después |
| `documentar-cambio` | Al terminar cualquier tarea | Cerrar un cambio sin su documentación, que es como se pierde el porqué |
| `informe` | Cuando se pide «el informe» | Que el informe para quien no programa acabe lleno de nombres de librería |

### Qué hace buena a una skill

Mirando las diez, se repiten cuatro cosas.

**Procedimiento numerado, no consejos.** `regla-de-negocio` dice: extrae la fórmula literal, sigue
las dependencias, escríbela en una frase en castellano, busca la referencia real, implementa como
función pura, valida con paridad. Seis pasos en ese orden.

**Los errores conocidos, con nombre.** `etl-excel` avisa de que la cabecera de la TCA está en la
fila 2 y de que la consola de Windows revienta con `β-caroteno`. `regla-de-negocio` avisa de que
Excel redondea donde tú no y de que una celda vacía vale 0 en una suma pero no cuenta en una media.
Eso es lo que convierte un documento en una skill: la trampa concreta que ya te comió una tarde.

**El límite de la autoridad.** Casi todas terminan diciendo dónde hay que parar y preguntar.
`paridad-excel` lo dice con nombre y apellidos: si añades una cuarta divergencia declarada, primero
pides permiso.

**Números reales.** 4.272 celdas de texto, 28 alérgenos sin dato, 97 reclasificaciones, tolerancia
0,01. Una skill con cifras se puede comprobar; una con adjetivos, no.

### Las que vienen de fuera

Con los plugins instalados llegan `/code-review`, `/commit`, `/skill-creator` y `frontend-design`,
entre otras. La útil de verdad para montar lo tuyo es **`skill-creator`**: crea skills nuevas,
mejora las que ya tienes y puede correr evaluaciones para medir si una skill se dispara cuando debe.

**Portable:** la estructura y las cuatro propiedades de arriba. El contenido no, evidentemente.

---

## 4. Subagentes

Un subagente es una sesión aparte con su propio contexto, su propio modelo y su propia lista de
herramientas. Se define en `.claude/agents/<nombre>.md`:

```markdown
---
name: revisor-capas
description: Revisa que la separación de capas se respeta y que el dominio sigue puro.
tools: Read, Grep, Glob, Bash
model: sonnet
---
```

Aquí hay dos, y los dos comparten la misma idea: **revisan, no arreglan**.

| Agente | Para qué | Cómo trabaja |
|---|---|---|
| `revisor-capas` | Comprobar que el dominio sigue puro y que no hay cálculo fuera de sitio | Empieza por los imports de `packages/dominio/src/`, ordena los hallazgos por gravedad, cada uno con ruta y línea |
| `auditor-paridad` | Dictaminar si una diferencia contra el patrón oro es un bug o una divergencia esperada | Ejecuta la suite, clasifica cada fallo (bug, divergencia declarada, ruido de coma flotante, dato sucio de origen) y da un veredicto por fallo, no uno global |

Tres detalles del diseño que importan:

**Herramientas recortadas a lectura.** `Read, Grep, Glob, Bash` y nada más. Un revisor que puede
escribir acaba arreglando lo que encuentra, y entonces ya no es un revisor: es otro autor cuyo
trabajo nadie ha mirado.

**Modelo barato.** Los dos van con `sonnet`. Buscar imports prohibidos y clasificar fallos de una
suite no necesita el modelo grande, y el ahorro es directo.

**Prohibido inventar hallazgos.** Los dos prompts lo dicen: si no encuentras nada, dilo claro. Sin
esa frase, un revisor siempre encuentra algo, aunque sea decorativo, y acabas ignorándolo.

**Portable:** los dos patrones. Un revisor de arquitectura y un auditor de la métrica que define
«correcto» en tu proyecto. Si en el tuyo lo que manda es el rendimiento o la accesibilidad, ese es
tu segundo agente.

---

## 5. Hooks

Un hook es un programa que Claude Code ejecuta en un momento concreto del ciclo. Recibe por la
entrada estándar un JSON con lo que va a pasar y decide con el código de salida:

| Código | Qué significa |
|---|---|
| `0` | Adelante, sin decir nada |
| `2` | Bloquea la acción, y lo que escribas en `stderr` se lo lleva el modelo como aviso |
| Otro | Error del hook, no bloquea |

Se declaran en `.claude/settings.json`, que **sí va a git**, para que lo tenga quien clone el
repositorio. Este proyecto tiene tres.

### `proteger-referencia.mjs` · PreToolUse sobre `Write|Edit|NotebookEdit`

Bloquea la escritura en tres sitios: `referencia/prototipo/` (el Excel original del dietista),
`referencia/` entero (libros congelados, especificación y patrones oro) y
`packages/app/src/generado/bindings.ts` (lo escribe tauri-specta).

Lo importante es el mensaje. No dice «prohibido»: dice por qué y qué hacer en su lugar.

> `referencia/` es de solo lectura. Contiene los libros congelados, la especificación del MVP y los
> patrones oro contra los que se valida todo el cálculo. Si necesitas regenerar un patrón oro,
> hazlo con un script del ETL que escriba en `datos/`, y pide permiso antes.

Un bloqueo sin salida obliga a una ronda entera de conversación. Un bloqueo que enseña la salida se
resuelve en el mismo turno.

### `formatear.mjs` · PostToolUse sobre `Write|Edit`

Pasa Biome a lo que se escriba en `packages/` y `cargo fmt` a lo de `src-tauri/`. Dos decisiones
pequeñas y buenas: usa `npx --no-install` para no instalar nada por sorpresa, y **traga cualquier
error sin bloquear**. Formatear nunca puede parar el trabajo.

El efecto secundario que interesa: el formato deja de aparecer en la conversación. No hay que
pedirlo, ni recordarlo, ni corregirlo después.

### `comprobar-paridad.mjs` · Stop

Al terminar el turno, si hay cambios sin confirmar en `packages/dominio`, lanza la suite de paridad.
Si falla, sale con 2 y le recuerda al modelo que la tolerancia es 0,01 y que no se sube.

Está escrito con cuidado para no molestar. Se rinde y sale con 0 si:

- el hook ya se ha disparado en esta cadena (`stop_hook_active`), que es la protección contra bucles
- no existe `package.json` o no existe `packages/dominio`
- no hay script `test:paridad`
- no hay ficheros de test en `packages/dominio/tests/paridad/`
- `git status --porcelain -- packages/dominio` sale vacío

Esa última comprobación es la que hace el hook usable: si no has tocado el dominio, no gastas una
ejecución de la suite. Un hook que se dispara siempre acaba desactivado.

**Portable:** los tres, cambiando rutas. El de protección de ficheros congelados y el de formato son
prácticamente universales. El tercero es el patrón general de «al cerrar el turno, comprueba lo que
define correcto en tu proyecto», y ahí cada uno pone lo suyo.

### Dónde va cada ajuste

| Fichero | Va a git | Qué lleva aquí |
|---|---|---|
| `.claude/settings.json` | Sí | Los hooks, que son del proyecto y valen para quien lo clone |
| `.claude/settings.local.json` | No, está en `.gitignore` | Los plugins habilitados, que son de cada máquina |
| `~/.claude/settings.json` | No aplica | Modelo, esfuerzo, tema, marketplaces, variables de entorno |

---

## 6. Plugins

Un plugin empaqueta skills, comandos, agentes, hooks o servidores MCP y se instala desde un
marketplace. En este proyecto hay siete habilitados a nivel de proyecto y cuatro a nivel global.

### Los del proyecto

| Plugin | Para qué está |
|---|---|
| `typescript-lsp` | Servidor de lenguaje de TypeScript: ir a la definición, buscar referencias, diagnósticos |
| `rust-analyzer-lsp` | Lo mismo para Rust, que es la mitad del proyecto |
| `pyright-lsp` | Lo mismo para el Python del ETL |
| `code-review` | `/code-review`: lanza varios agentes en paralelo sobre el diff y filtra por confianza antes de reportar |
| `security-guidance` | Tres capas: avisos por patrón al escribir, revisión del diff al cerrar el turno y revisión agéntica al hacer commit |
| `skill-creator` | Crear y afinar skills propias, con evaluaciones para medir si se disparan cuando deben |
| `commit-commands` | `/commit`, `/commit-push-pr`, `/clean_gone` |

**Los tres LSP son los que más rinden y los que menos se notan.** Un servidor de lenguaje contesta
«dónde está definido esto» sin que nadie tenga que leer ficheros enteros buscándolo. Necesitan el
servidor instalado por debajo: `npm install -g typescript-language-server typescript`,
`rustup component add rust-analyzer`, `pipx install pyright`.

**`commit-commands` tiene una tensión con la regla 4 de este proyecto**, que prohíbe que el modelo
escriba en el historial de git. Está instalado, pero lo que se aprovecha es el borrador del mensaje,
no la ejecución. Si en tu proyecto no tienes esa regla, `/commit` se usa entero.

### Los globales

| Plugin | Para qué está |
|---|---|
| `context7` | Servidor MCP que trae documentación actual de librerías. Se usa antes de escribir contra una API, no después de equivocarse |
| `playwright` | Servidor MCP para conducir un navegador: clics, formularios, capturas, consola |
| `frontend-design` | Interfaces que no parecen generadas por defecto: tipografía, paleta, detalle |
| `typescript-lsp` | Repetido a nivel global porque vale para cualquier proyecto |

**`context7` merece un párrafo.** La regla 2 del `CLAUDE.md` pide buscar qué se usa hoy antes de
elegir una dependencia, y no heredar lo que diga un documento sin comprobarlo. Un modelo con fecha
de corte opina sobre la versión que conoció; `context7` trae la de ahora. Cuesta una llamada y
ahorra la ronda de «esto ya no existe en la versión 5».

### Marketplaces registrados

Además del oficial (`claude-plugins-official`), están dados de alta `claude-community`,
`karpathy-skills`, `claude-code-skills`, `claude-code-workflows` y `gsap-skills`. Registrar un
marketplace no instala nada: solo lo hace buscable.

**Portable:** los LSP del lenguaje que uses, `context7` y `skill-creator` son la base mínima.
`security-guidance` si tocas datos sensibles. `playwright` solo si vas a probar contra navegador de
verdad.

---

## 7. Entradas congeladas y salidas generadas

Este es el patrón que más veces salva el proyecto y el que menos se ve.

La raíz se ordena por **tipo de contenido**, y dos de los cinco tipos son especiales:

| Tipo | Carpeta | Regla |
|---|---|---|
| Entradas congeladas | `referencia/` | Solo lectura, sellada con SHA-256, con hook que lo impide |
| Salidas generadas | `datos/`, `bindings.ts`, `AVISOS-TERCEROS.md` | Se reconstruye con una orden. Editarlo a mano no sirve de nada |

### Los sellos

`referencia/sellos.sha256` guarda el hash de cada libro de Excel y de cada patrón oro.
`npm run comprobar:referencia` los verifica y falla con un mensaje que dice qué hacer:

> `referencia/` no se toca. Si el cambio es deliberado, documéntalo en un ADR y regenera
> `sellos.sha256` en el mismo commit.

Cuesta cuarenta líneas de Node y responde a una pregunta que de otra forma no tiene respuesta: **¿el
Excel contra el que valido hoy es el mismo de hace tres meses?**

### El circuito completo

```
referencia/libros/*.xlsx          congelado, sellado, con hook
        │  npm run etl
        ▼
datos/                            generado, en .gitignore, se regenera entero
        │  el dietista revisa y sella
        ▼
referencia/patrones-oro/          congelado, sellado
        │
        ▼
packages/dominio/tests/paridad/   compara contra el sello
```

El ETL **no puede escribir en `referencia/`**, lo bloquea el hook. Escribe en `datos/`, y el paso de
`datos/` a `referencia/` lo hace una persona a mano, a propósito. Es el punto donde alguien mira los
números antes de convertirlos en la verdad del proyecto.

### Los ficheros generados

`packages/app/src/generado/bindings.ts` lo escribe tauri-specta cuando corre `cargo test`. Lleva
cabecera «Generado por tauri-specta. No editar a mano», está excluido de Biome, está excluido del
test de vocabulario y hay un hook que impide escribirlo. Cuatro capas para la misma regla, porque el
fallo (editarlo a mano y perderlo en la siguiente regeneración) es silencioso.

`docs/legal/AVISOS-TERCEROS.md` se regenera con `npm run avisos` desde el grafo real de
dependencias, y está marcado como `linguist-generated` en `.gitattributes` para que no ensucie los
diffs.

**Portable:** entero, y es de lo primero que montaría en un proyecto nuevo. Si tienes una entrada que
define lo correcto (un dataset, unos fixtures, un contrato de API), séllala. Si tienes un fichero
que produce una herramienta, marca que es generado y bloquéalo.

---

## 8. Tests que vigilan las reglas

Las reglas de arquitectura se erosionan porque nadie las mira. La solución aquí es que se miren
solas.

### `pureza.test.ts`

Recorre todos los `.ts` de `packages/dominio/src/` y falla si encuentra:

- un import que no empiece por `./` o `../`, incluidos los dinámicos y los `require`
- `Date.now()`, `new Date()` sin argumento, `Math.random()`, `console.*`, `process.env`,
  `globalThis`, `performance.now()`, `crypto.randomUUID()` o `fetch()`
- cualquier dependencia declarada en el `package.json` del dominio, incluidas las de desarrollo

Es la regla «el dominio es puro» convertida en algo que se ejecuta. Un `it.each` por fichero, así
que el fallo te dice exactamente cuál.

### `vocabulario.test.ts`

Recorre `packages/app/src/`, saltándose lo generado, y falla si:

- aparece la palabra «paciente» en la interfaz, que por el ADR 0014 dice «cliente»
- aparece un nombre de ingesta cableado («desayuno», «merienda», «recena»...), porque por el
  ADR 0017 las ingestas son un catálogo editable y no un enumerado
- las secciones del marco no son las cuatro del plan, o no están congeladas
- los alérgenos no son catorce, o hay claves repetidas

Es un ADR que se defiende solo. Un test así vale más que tres párrafos en un documento, porque el
documento no salta cuando alguien lo incumple.

### En Rust

`cargo test` incluye `exporta_bindings`, que regenera `bindings.ts` en cada ejecución: si alguien
cambia una firma y no regenera, TypeScript deja de compilar. Hay un test que falla si alguien quita
el `PRAGMA foreign_keys`, y otro que busca el nombre de un paciente en los bytes crudos del fichero
cifrado y falla si lo encuentra.

**Portable:** el patrón, que es el más rentable de todos. Coge tus dos o tres reglas de arquitectura
más caras de violar y escribe el test que las comprueba leyendo el código fuente como texto. No es
elegante y funciona.

---

## 9. La documentación como sistema

Cinco piezas, cada una con un lector distinto.

**El enrutador.** `docs/README.md` está ordenado por «a qué vienes», no por tipo de fichero. Una
tabla de doce filas del estilo «vengo a portar una fórmula del Excel → empieza por
`REGLAS-NEGOCIO.md`». El `CLAUDE.md` tiene su propia versión más corta. Un índice que se lee en
veinte segundos evita explorar el repositorio a ciegas.

**Los ADR.** Formato de Michael Nygard, corto a propósito: contexto, alternativas, decisión,
consecuencias. Numerados sin huecos, con estado (propuesto, aceptado, sustituido, rechazado). Dos
reglas los hacen útiles:

- **Un ADR aceptado no se edita.** Si la decisión cambia, se escribe otro que lo sustituya y el
  viejo pasa a «sustituido» con el enlace. El ADR 0013 lo sustituye el 0024, y los dos siguen ahí.
- **La sección de consecuencias negativas no puede estar vacía.** Toda decisión cuesta algo; si no
  encuentras qué, no has entendido la alternativa que descartaste. El ADR 0027 abre sus
  consecuencias con «lo caro: el calendario se dobla».

El `CLAUDE.md` remata la idea: «los cambios ya autorizados están en `docs/tecnica/adr/`. Consúltalos
antes de preguntar dos veces por lo mismo».

**Las dos versiones.** `docs/tecnica/` para quien va a modificar el código: nombres reales, tipos,
casos límite. `docs/aprende/` para quien empieza y no conoce el proyecto: el porqué antes del cómo,
sin dar por sabido el vocabulario. No son la misma cosa resumida, son dos lectores.

**El diario.** Una entrada por paquete cerrado en `docs/aprende/diario/`, con cinco apartados: qué
había antes, qué se ha construido, qué decisión costó tomar, qué se rompió por el camino y qué queda
pendiente. Es lo que permite que la sesión de dentro de tres semanas no reconstruya el razonamiento
desde el `git log`.

**Las preguntas bloqueantes.** Cuando un paquete se para porque hay que preguntar algo, la duda se
escribe en un fichero con sus números, y la respuesta se escribe debajo con el enlace a dónde acabó.
`docs/tecnica/preguntas-t09-recetas.md` es el ejemplo: cuatro preguntas, cuatro respuestas, una
tabla que dice en qué ADR o en qué fichero quedó cada una. Preguntar sin dejar rastro es preguntar
dos veces.

**Portable:** el enrutador, los ADR y el diario, sin discusión. Las dos versiones de la
documentación solo si tu proyecto tiene de verdad dos lectores.

---

## 10. Planificar el trabajo

**Paquetes, no fases.** El plan son 23 paquetes numerados, cada uno con su ficha: qué entra, de qué
depende, qué vistas toca, cuánto esfuerzo y a qué carril pertenece. Un carril es un conjunto de
paquetes que tocan las mismas carpetas.

**Se trabaja en serie, uno cada vez.** Se montó el protocolo entero para trabajar con varias
sesiones en paralelo (reparto de ficheros por carril, lista de ficheros prohibidos, `git worktree`,
directorio de compilación compartido, pasada de integración por tanda) y se descartó el 28 de agosto
de 2026, en el ADR 0027. El motivo vale la pena leerlo antes de montar lo mismo en otro sitio: el
paralelismo se rompía por dos ficheros únicos por los que pasan todos los carriles (`lib.rs` y
`bindings.ts`), y el ahorro de calendario no incluía la revisión que hacía falta después.

`PARALELIZACION.md` se queda en el repositorio marcado como descartado, con lo que sigue valiendo
rescatado arriba del todo. **Descartar no es borrar.**

### El prompt de arranque

Cada paquete tiene un prompt que se pega tal cual al abrir la sesión. La estructura es lo que
importa:

1. Qué paquete vas a implementar y de qué documento sale
2. **Qué leer, en orden y numerado.** Ocho entradas, con el apartado concreto de cada documento, no
   el documento entero
3. Dónde escribes, carpeta por carpeta, con una línea de qué va en cada una
4. Qué no tocas en ningún caso, con el motivo al lado
5. Cuáles son los documentos congelados y que, si hay que cambiar uno, se para
6. Cómo te validas (en el T-05, con tests, porque ese paquete no trae pantalla)
7. **Terminado cuando**, con siete condiciones comprobables
8. No hagas commit; al terminar, dime el `git status`, qué entra y el mensaje propuesto

Los puntos 2 y 7 son los que hacen el trabajo. Una lista de lectura cerrada evita que la sesión
explore el repositorio buscando contexto, y una definición de «terminado» evita la conversación de
«¿esto ya está?».

### Cómo se cierra un paquete

Cinco cosas, y las cinco. Un paquete que cumple cuatro no está cerrado.

1. Los tests pasan, incluida la suite de paridad si se tocó cálculo
2. `npm run check` y `cargo clippy` limpios, sin avisos silenciados
3. La documentación está actualizada, cada cambio en su fichero
4. El contrato está regenerado si se tocó una firma de Rust
5. El árbol queda listo y se avisa, con `git status`, qué entra, qué se queda fuera y el mensaje de
   commit propuesto

Más la entrada en el diario.

**Portable:** el prompt de arranque y la lista de cierre, tal cual. Son dos plantillas de veinte
líneas y cambian por completo cómo empieza y cómo acaba una sesión.

---

## 11. Economía de contexto y de tokens

En el repositorio no hay ningún documento que hable de tokens. El ahorro no está escrito: está
montado. Estos son los mecanismos que lo producen, y todos se pueden comprobar mirando los ficheros.

### Enrutar en vez de volcar

`CLAUDE.md` se lee entero en cada sesión, así que todo lo que metas ahí lo pagas siempre. Aquí ocupa
lo justo y lo demás lo resuelve una tabla de «para esto, mira aquí». Lo mismo `docs/README.md`. La
sesión llega al documento correcto en un salto en vez de leer cuatro para encontrarlo.

### Carga bajo demanda

Diez skills, y de cada una solo se carga siempre su `description`, dos líneas. El procedimiento
entero (el de `informe` pasa de 120 líneas) llega cuando se invoca. Si esas diez skills estuvieran en
el `CLAUDE.md`, se pagarían en cada sesión aunque la tarea del día no tuviera nada que ver.

### Delegar en un subagente barato

`revisor-capas` y `auditor-paridad` corren en `sonnet` con cuatro herramientas de lectura. Hacen su
trabajo en su propio contexto y devuelven un veredicto de veinte líneas. La alternativa, que la
sesión principal lea todos los imports del dominio, gasta el contexto caro y lo deja lleno de
ficheros que ya no hacen falta.

### Que lo determinista lo haga un hook

Formatear, verificar hashes, lanzar una suite y bloquear una escritura prohibida no necesitan un
modelo. Cada una de esas cosas hecha por un hook es una ronda de conversación que no ocurre. El caso
más claro es `proteger-referencia`: sin él, el modelo escribe en `referencia/`, se da cuenta después,
y hay que deshacerlo. Con él, no llega a pasar.

Y los hooks están escritos para no dispararse de más. El de paridad comprueba cinco condiciones antes
de lanzar la suite, entre ellas que haya cambios sin confirmar en `packages/dominio`.

### Escribir la decisión una vez

Los ADR, los cinco documentos congelados (modelo de datos, contrato IPC, reglas de negocio,
decisiones de diseño y el roadmap) y el diario existen para que la respuesta se dé una vez. La regla
está literal en el `CLAUDE.md`: consulta los ADR antes de preguntar dos veces por lo mismo. Cada
pregunta que no se repite es una conversación entera que no se paga.

El diario hace lo mismo con el contexto: la sesión que abre el T-09 lee la entrada del T-08 en vez de
reconstruir qué pasó a partir de veinte commits.

### La memoria del proyecto

En `~/.claude/projects/<proyecto>/memory/` hay tres ficheros, uno por hecho, con un `MEMORY.md` de
tres líneas que es lo único que se carga en cada sesión. Guardan lo que no está en el código ni en el
historial: que el diseño está cerrado 118 de 118 y solo el REE tiene un fleco, que el T-09 espera un
sellado del dietista, cómo prefiere el usuario que se planifique el trabajo.

La regla para que no se hinche: no se guarda lo que el repositorio ya cuenta. Estructura del código,
arreglos pasados, historial de git y `CLAUDE.md` se quedan fuera.

### Prompt de arranque con lista de lectura cerrada

Ocho documentos, con el apartado concreto de cada uno. Sin eso, la sesión abre el roadmap entero (689
líneas), el contrato entero y el modelo de datos entero para quedarse con tres apartados.

### Un paquete por sesión

El ADR 0027 se decidió por orden y por calidad de revisión, no por tokens, pero tiene ese efecto de
lado: una sesión trabaja sobre un paquete, con un `git status` que enseña un paquete y no tres. El
contexto no se llena de trabajo que pertenece a otro sitio.

### No leer lo generado

`bindings.ts`, `datos/` y `AVISOS-TERCEROS.md` están marcados como generados, excluidos de Biome, de
los tests que recorren el código y de git donde procede. Nadie los abre para entender nada, porque no
hay nada que entender en ellos.

### Los ajustes del cliente

En `~/.claude/settings.json`:

| Ajuste | Valor aquí | Qué hace |
|---|---|---|
| `CLAUDE_CODE_DISABLE_1M_CONTEXT` | `1` | Apaga la ventana de contexto de un millón. La compactación llega antes, pero las peticiones no entran en el tramo de contexto largo |
| `effortLevel` | `medium`, y `xhigh` solo para Opus 5 | Cuánto razona el modelo antes de contestar. Subirlo en el modelo grande y dejarlo medio en el resto |
| `model` | `opus` | El modelo por defecto de las sesiones |

Los subagentes llevan su propio `model` en la cabecera, así que la sesión puede ir en Opus y la
revisión en Sonnet.

### Resumen

| Técnica | Qué gasto evita | Dónde está |
|---|---|---|
| Enrutar, no volcar | Leer cuatro documentos para encontrar uno | `CLAUDE.md`, `docs/README.md` |
| Skills bajo demanda | Pagar diez procedimientos en cada sesión | `.claude/skills/` |
| Subagente barato y de solo lectura | Llenar el contexto caro de ficheros de paso | `.claude/agents/` |
| Hooks | Rondas de conversación sobre formato, verificación y errores prohibidos | `.claude/hooks/` |
| ADR y contratos congelados | Volver a decidir lo ya decidido | `docs/tecnica/` |
| Diario por paquete | Reconstruir el contexto desde el historial de git | `docs/aprende/diario/` |
| Memoria del proyecto | Repetir lo que solo sabe el usuario | `~/.claude/projects/.../memory/` |
| Lista de lectura cerrada | Explorar el repositorio buscando contexto | `docs/plan/prompts/` |
| Marcar lo generado | Leer o editar ficheros que no aportan nada | `bindings.ts`, `datos/` |
| LSP y `context7` | Grep a ciegas y equivocarse con una API vieja | Plugins |

### Lo que no está montado aquí y cuesta poco

**Una lista de permisos.** `.claude/settings.local.json` solo tiene plugins habilitados. Cada
`npm test` o `git status` pide confirmación, y eso son interrupciones. La skill
`fewer-permission-prompts` revisa las transcripciones y propone la lista.

**Vaciar el contexto entre paquetes.** El cierre de paquete deja entrada de diario y `git status`
propuesto, que es justo el resumen que hace falta para arrancar limpio después. Falta la costumbre de
hacerlo.

**Integración continua.** Los hooks corren en la máquina de quien programa. Lo mismo en un CI
verificaría que quien clone el repositorio no se salta nada.

---

## 12. Llevártelo a otro proyecto

Por orden de lo que más rinde primero.

### Paso 1 · El esqueleto

```
tu-proyecto/
├── CLAUDE.md
└── .claude/
    ├── settings.json          hooks, va a git
    ├── settings.local.json    plugins, en .gitignore
    ├── hooks/
    │   ├── proteger.mjs       PreToolUse sobre Write|Edit
    │   └── formatear.mjs      PostToolUse sobre Write|Edit
    ├── skills/
    │   └── <una-por-tarea-recurrente>/SKILL.md
    └── agents/
        └── revisor.md
```

El `CLAUDE.md` con la estructura del apartado 2: tabla de qué leer, reglas numeradas con su
consecuencia, glosario de dominio. Empieza corto. Un `CLAUDE.md` de cuatro páginas se ignora entero.

### Paso 2 · Los dos hooks universales

El de protección y el de formato funcionan en cualquier proyecto cambiando las rutas y el comando.
Copia `proteger-referencia.mjs` y cambia el array `PROTECTED`: cada entrada es un patrón y un motivo
escrito para que se pueda leer y actuar en consecuencia.

### Paso 3 · Las skills de lo que repites

No inventes skills por si acaso. Mira qué explicaste tres veces la semana pasada y escribe esa. La
prueba de que una skill hace falta es que ya has tenido que repetir el procedimiento.

Cuatro cosas en cada una: el procedimiento numerado, las trampas concretas con nombre, dónde hay que
parar y preguntar, y números reales en vez de adjetivos.

### Paso 4 · Los plugins

Los LSP de tus lenguajes, `context7` y `skill-creator`. `security-guidance` si tocas datos sensibles.
El resto, cuando lo eches de menos.

### Paso 5 · Sellar lo que define «correcto»

Si tu proyecto tiene una entrada que es la verdad (un dataset, unos fixtures, un contrato de API, una
salida de referencia), séllala con hashes, protégela con el hook y escribe el script que comprueba
los sellos. Cuarenta líneas.

### Paso 6 · Los tests que vigilan reglas

Dos o tres, los de tus reglas más caras de violar. Recorren el código fuente como texto y fallan con
el fichero y la línea.

### Paso 7 · Documentación con historia

`docs/README.md` como enrutador, ADR numerados sin huecos que no se reescriben, y un diario por
bloque de trabajo cerrado.

### Lo que no te lleves

- Las diez skills de aquí. El contenido es de nutrición, de Excel y de Tauri
- La tolerancia 0,01 y el patrón oro, salvo que también estés migrando un sistema que ya funciona
- La regla 4, que prohíbe al modelo hacer commit, salvo que la quieras
- El plan de 23 paquetes. La forma sí, el contenido no

---

## Resumen en cinco frases

Escribe el contrato corto y enruta al resto. Convierte cada procedimiento repetido en una skill con
sus trampas concretas. Lo que se puede comprobar sin un modelo, que lo compruebe un hook o un test.
Cada decisión se escribe una vez, con lo que se descartó y qué cuesta. Y lo que define «correcto» en
tu proyecto se congela, se sella y no se toca.

---

**Ver también:** [`ESTRUCTURA.md`](ESTRUCTURA.md) para dónde va cada fichero,
[`adr/0027-desarrollo-en-serie.md`](adr/0027-desarrollo-en-serie.md) para por qué se descartó el
trabajo en paralelo, [`adr/0031-estructura-del-repositorio.md`](adr/0031-estructura-del-repositorio.md)
para el orden de la raíz, y [`../plan/PARALELIZACION.md`](../plan/PARALELIZACION.md) para el
protocolo descartado que sigue siendo correcto si las condiciones cambian.
