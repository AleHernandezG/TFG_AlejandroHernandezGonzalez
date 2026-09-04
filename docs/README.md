# Documentación de Cookr

141 ficheros. La mayoría son de marzo a junio de 2026 y describen decisiones de sprints que ya se
cerraron. Este índice existe para que no haya que abrir ninguno para saber cuál sirve.

Cada carpeta responde a una pregunta distinta. Si dudas de dónde va algo nuevo, la pregunta te lo
dice.

```
docs/
├── estado/       ¿qué pasa ahora y qué toca hacer?
├── referencia/   ¿cómo es Cookr por dentro?
├── cambios/      ¿qué se tocó, cuándo y por qué?
├── diseno/       ¿cómo tiene que verse?
└── historico/    fue cierto y ya no lo es. No se consulta para decidir
```

Sueltos en la raíz de `docs/` hay tres ficheros más que no salieron de aquí: los generó otra
herramienta el 4 de septiembre y se leen con cuidado. Están descritos abajo, en su propio apartado.

Fuera de aquí, y por encima de todo esto: **`../CLAUDE.md`**, el contrato del repositorio. Es lo
único que se lee siempre. En la raíz también viven `../README.md`, `../REVISION_DESPLIEGUE.md` y
`../PLAN_AUDITORIA.md` (auditoría de julio, fases 1 a 4 cerradas; la continúa
`estado/plan-2026-09.md`).

---

## Qué leer según lo que vayas a hacer

| Vas a... | Lee |
|---|---|
| Tocar cualquier cosa | `../CLAUDE.md` |
| Saber qué está roto ahora mismo | `estado/auditoria-2026-09.md` |
| Saber qué toca hacer y en qué orden | `estado/plan-2026-09.md` |
| Ver el catálogo de producto que viene después | `informe_auditoria_mejoras.md`, y el plan a partir de F12 |
| Comprobar algo a mano en un rato libre | `estado/pruebas-manuales.md` |
| Entender por qué el código es como es | `cambios/` y `historico/fases/tech-debt.md` |
| Desplegar o revisar producción | `../REVISION_DESPLIEGUE.md` |
| Entender la infraestructura y los servicios externos | `referencia/infraestructura.md` |
| Saber dónde va cada fichero del frontend | `referencia/estructura-frontend.md` |
| Cambiar cómo trabajamos con Claude Code | `referencia/metodo-cookr.md` |
| Maquetar una pantalla | `diseno/stitch/` |

---

## `estado/` · lo que pasa ahora

| Documento | Qué es |
|---|---|
| `auditoria-2026-09.md` | Auditoría del 4 de septiembre. Cada hallazgo con fichero, línea, impacto y arreglo |
| `plan-2026-09.md` | El plan que sale de esa auditoría. Bloques F0 y F6 a F12, con criterio de cierre comprobable |
| `pruebas-manuales.md` | Lo que los tests no pueden comprobar: Google real, entrega de correo, el proxy. Con pasos y síntomas |
| `diario.md` | Una entrada por sesión de trabajo |

Estos cuatro se actualizan. El resto de la carpeta `docs/`, no.

---

## Los tres ficheros sueltos de la raíz

Del 4 de septiembre, generados con otra herramienta a partir del código y de la auditoría.

| Documento | Qué es |
|---|---|
| `informe_auditoria_mejoras.md` | Informe técnico y catálogo de producto: diagnóstico, tabla de escalabilidad, once funcionalidades nuevas y un cronograma con fechas |
| `presentacion_cookr.html` | Lo mismo como presentación de seis pantallas, para enseñarlo sin leer el informe |
| `video_auditoria_cookr.webp` | La animación que acompaña al informe |

**Cómo se leen.** Sirven para decidir qué construir, no para saber qué hay construido. Hablan en
pasado de cuatro cosas que no existen (streaming por SSE, búsqueda difusa, caché de IA en Redis y
normalización de unidades) y dan cifras viejas: 80 tests, cuando hay 123. Lo que faltaba de ellos ya
está volcado en `estado/plan-2026-09.md`, con el estado real de cada cosa, en los bloques F7.5,
F7.6, F13, F14, F15 y F12.

---

## `referencia/` · cómo es Cookr hoy

| Documento | Qué es |
|---|---|
| `infraestructura.md` | Stack, servicios externos, variables de entorno. De junio, correcto en lo esencial |
| `estructura-frontend.md` | Estructura de carpetas del cliente y convenciones de nombres |
| `metodo-cookr.md` | Qué se adopta del método de DietMetric y qué no, con el porqué |
| `sinergias-proyectos.md` | Análisis de proyectos en `Desktop/Proyectos` y módulos reutilizables para Cookr |

Falta el contrato de la API: los 37 endpoints solo se conocen leyendo `backend/src/routes/`. Es la
tarea F10.3 del plan, y cuando se escriba vive aquí.

---

## `cambios/` · qué se tocó y por qué

Un documento por bloque de trabajo cerrado. No es un changelog de commits: recoge las decisiones
que costaron y lo que quedó a medias, que es lo que no se puede reconstruir leyendo el diff.

| Documento | Qué es |
|---|---|
| `f6-seguridad.md` | Bloque F6, 4 de septiembre. Verificación del `id_token`, proxy cerrado, `$regex` escapado, 404 en JSON |
| `f7-rendimiento.md` | Bloque F7, 4 de septiembre. Índices en Mongo, el feed ordenado en la base, escrituras atómicas y las imágenes fuera de Mongo (F7.4, migrado: 6,72 MB → 0,24 MB) |

---

## `diseno/` · cómo tiene que verse

| Qué | Dónde |
|---|---|
| Maquetas de las pantallas, con captura y HTML | `stitch/`, una carpeta por pantalla |
| Wireframes | `wireframes/`, tres PDF |
| Casos de uso | `casos-de-uso.html` |
| Pruebas de interfaz | `pruebas-ui.pdf` |

Material de marzo. Sigue valiendo como referencia visual, pero donde el código y la maqueta no
coincidan, manda el código.

---

## `historico/` · fue cierto, ya no

No se borra: es material de la memoria del TFG y explica cómo se llegó hasta aquí. Pero **no se
usa para tomar decisiones**.

| Carpeta o documento | De cuándo | Qué es |
|---|---|---|
| `desarrollo/` | marzo a junio | 52 ficheros, casi todos `.html`: planes de implementación de funcionalidades concretas. Los `.md` de dentro (feed-score, caché de Gemini, cascada de Pexels) siguen siendo útiles si tocas esos servicios |
| `fases/` | marzo a junio | Siete informes de fase. `tech-debt.md` es el más útil de los siete |
| `sprints/` | abril a junio | Roadmap y planes de los sprints 4, 5 y 6, ya cerrados |
| `cambios/` | variable | Los tres registros por área (api, dominio, ui) que se dejaron de mantener. Los sustituye `cambios/` |
| `rules.md` | 30 de abril | 498 líneas de reglas de arquitectura anteriores a `CLAUDE.md` |
| `context.md` | 18 de mayo | Dice «Sprint 5 activo». Lo reemplazó `CLAUDE.md` |
| `metodo-dietmetric.md` | — | El método de DietMetric tal cual, como material de referencia. Lo que aplica a Cookr está filtrado en `referencia/metodo-cookr.md` |

---

## Un aviso que conviene no olvidar

**`historico/rules.md` compite con `CLAUDE.md`.** Su cabecera dice «adjuntar al inicio de cada
sesión de desarrollo», y eso dejó de ser verdad en julio. Si alguien lo carga por costumbre, se
lleva reglas de abril. Está en `historico/` justo por eso: donde discrepen, manda `CLAUDE.md`.
