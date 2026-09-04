# Índice de `docs/`

Aquí hay 44 documentos `.md`, 59 `.html` y 4 PDF. La mayoría son de marzo a junio de 2026 y
describen decisiones de sprints que ya se cerraron. Este índice existe para que no haya que
abrirlos uno a uno para averiguar cuál sigue sirviendo.

**Vigente** quiere decir que describe el proyecto tal y como está hoy.
**Histórico** quiere decir que fue cierto y ya no lo es. No se borra: es material de la memoria
del TFG y explica cómo se llegó hasta aquí. Pero no se usa para tomar decisiones.

---

## Qué leer según lo que vayas a hacer

| Vas a... | Lee |
|---|---|
| Trabajar en cualquier cosa | `../CLAUDE.md` primero. Es el contrato del repositorio |
| Saber qué está roto ahora mismo | `AUDITORIA-2026-09.md` |
| Saber qué toca hacer y en qué orden | `PLAN-2026-09.md` |
| Desplegar o revisar producción | `../REVISION_DESPLIEGUE.md` |
| Entender la infraestructura y los servicios externos | `infraestructura.md` |
| Montar el entorno o entender dónde va cada fichero del frontend | `folderStructure.md` |
| Cambiar cómo trabajamos con Claude Code | `METODO-COOKR.md` |

Ese orden importa: `CLAUDE.md` es lo único que se lee siempre. Todo lo demás se consulta cuando
hace falta.

---

## Vigente

| Documento | Qué es |
|---|---|
| `AUDITORIA-2026-09.md` | Auditoría del 4 de septiembre. Hallazgos con fichero, línea y arreglo |
| `PLAN-2026-09.md` | Plan de trabajo que sale de esa auditoría. Bloques F0 y F6 a F12 |
| `changes/f6-seguridad.md` | Qué se tocó al cerrar el bloque F6, las decisiones que costaron y lo que quedó a medias |
| `METODO-COOKR.md` | Qué se adopta del método de DietMetric y qué no |
| `METODO-DE-TRABAJO.md` | El método de DietMetric, tal cual. Material de referencia, no aplica a Cookr sin adaptar |
| `infraestructura.md` | Stack, servicios externos, variables. Junio, sigue siendo correcto en lo esencial |
| `folderStructure.md` | Estructura de carpetas del frontend y convenciones de nombres |

Fuera de esta carpeta, también vigente: `../CLAUDE.md`, `../README.md`,
`../REVISION_DESPLIEGUE.md` y `../PLAN_AUDITORIA.md` (fases 1 a 4 cerradas, Fase 5 abierta y
continuada en `PLAN-2026-09.md`).

---

## Histórico

Nada de esto describe el estado actual.

| Documento | De cuándo | Por qué ya no vale |
|---|---|---|
| `context.md` | 18 de mayo | Dice «Sprint 5 activo». Lo reemplazó `CLAUDE.md` |
| `rules.md` | 30 de abril | 498 líneas de reglas de arquitectura, anteriores a `CLAUDE.md`. Donde discrepen, manda `CLAUDE.md`. Además enlaza a `docs/tech-debt.md`, que está en `phase-reports/` |
| `roadmap.md` | 20 de abril | Roadmap de sprints hasta el 3. Lo continúan `PLAN_AUDITORIA.md` y `PLAN-2026-09.md` |
| `plan-sprint-5.md`, `plan-sprint-6.md` | mayo y junio | Sprints cerrados |
| `checklist-revision-sprint6.md` | 1 de junio | Cerrado |
| `tareas-vistas-pendientes.md` | 30 de abril | Lista de vistas del frontend, ya construidas |
| `phase-reports/` | marzo a junio | Siete informes de fase. `tech-debt.md` es el más útil de los siete para entender por qué el código es como es |
| `changes/` | variable | Tres registros de cambios por área (api, dominio, ui) que se dejaron de mantener. `f6-seguridad.md` sí está vigente, mira la tabla de arriba |
| `desarrollo/` | marzo a junio | 36 ficheros, casi todos `.html`: planes de implementación de funcionalidades concretas, exportados de una herramienta. Los `.md` de dentro son los planes de feed-score, caché de Gemini y cascada de Pexels, útiles si tocas esos servicios |
| `stitch/` | marzo | Maquetas de las ocho pantallas. Material de diseño |

`api-contracts/` está **vacía** desde que se creó. Lo que debería haber ahí es la tarea F10.3 del
plan.

---

## Dos avisos

**`rules.md` compite con `CLAUDE.md`.** Su cabecera dice «adjuntar al inicio de cada sesión de
desarrollo», y eso ya no es verdad desde julio. Si alguien lo carga por costumbre, se lleva reglas
de abril. Manda `CLAUDE.md`.

**No hay contrato de API.** Los 37 endpoints solo se conocen leyendo `backend/src/routes/`. Si
buscas la forma de una petición, ese es el sitio, no esta carpeta.
