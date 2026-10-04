# Documentación de Cookr

157 ficheros. La mayoría son de marzo a junio de 2026 y describen decisiones de sprints que ya se
cerraron. Este índice existe para que no haya que abrir ninguno para saber cuál sirve.

Cada carpeta responde a una pregunta distinta. Si dudas de dónde va algo nuevo, la pregunta te lo
dice.

```
docs/
├── estado/       ¿qué pasa ahora y qué toca hacer?
├── referencia/   ¿cómo es Cookr por dentro?
├── cambios/      ¿qué se tocó, cuándo y por qué?
├── decisiones/   ¿por qué se eligió esto y no lo otro?
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
| Retomar el trabajo tras unos días sin tocarlo | `estado/pendientes.md` |
| Probar lo último que se hizo y commitearlo | `estado/por-probar.md` |
| Saber qué acepta y qué devuelve un endpoint | `referencia/api.md` |
| Ver el catálogo de producto que viene después | `informe_auditoria_mejoras.md`, y el plan a partir de F12 |
| Comprobar algo a mano en un rato libre | `estado/pruebas-manuales.md` |
| Tocar cualquier pantalla, en móvil o escritorio | `estado/revision-ui-2026-09.md` |
| Rehacer el formulario de crear receta | `diseno/formulario-crear-receta.md` |
| Hacer Cookr instalable como aplicación | `estado/pwa.md` |
| Montar los eventos semanales o mensuales | `estado/eventos.md` |
| Entender por qué el código es como es | `decisiones/`, `cambios/` y `historico/fases/tech-debt.md` |
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
| `pendientes.md` | Foto de lo que falta: en qué rama estás, qué va después y qué dicen los últimos logs de GitHub. Si choca con el plan, manda el plan |
| `revision-ui-2026-09.md` | Revisión de interfaz del 18 de septiembre, móvil y escritorio. Doce puntos (UI-001 a UI-012) con fichero, línea y coste, más el resultado de axe-core sobre ocho rutas |
| `pwa.md` | Qué hace falta para que Cookr se instale como aplicación en PC, móvil y tablet: manifiesto, iconos, service worker y modo sin conexión |
| `eventos.md` | Diseño de los eventos semanales y mensuales de verdad, para sustituir el booleano `esEvento` y la tarjeta destacada inventada |
| `por-probar.md` | Lo que salió de la sesión del 4 de octubre: qué se hizo en cada bloque, cómo probarlo paso a paso, lo que no se pudo comprobar y los textos de commit y de PR. Se reescribe en cada sesión que deje trabajo sin commitear |
| `prompt-2026-10.md` | El prompt de arranque de la sesión del 4 de octubre: `callbackUrl`, test de seguir, F9.2, medición de F9.1, F10.3 y F10.4. Guardado tal cual se pegó; no se actualiza |

Los nueve primeros se actualizan. El resto de la carpeta `docs/`, no.

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
normalización de unidades) y dan cifras viejas: 80 tests, cuando hay 215. Lo que faltaba de ellos ya
está volcado en `estado/plan-2026-09.md`, con el estado real de cada cosa, en los bloques F7.5,
F7.6, F13, F14, F15 y F12.

---

## `referencia/` · cómo es Cookr hoy

| Documento | Qué es |
|---|---|
| `infraestructura.md` | Stack, servicios externos, variables de entorno. De junio; la sección 7 (URLs, deploy y variables) se revisó contra el código el 16/09/2026 |
| `estructura-frontend.md` | Estructura de carpetas del cliente y convenciones de nombres |
| `metodo-cookr.md` | Qué se adopta del método de DietMetric y qué no, con el porqué |
| `sinergias-proyectos.md` | Análisis de proyectos en `Desktop/Proyectos` y módulos reutilizables para Cookr |
| `api.md` | Contrato de la API, del 4 de octubre: los 40 endpoints con método, ruta, auth, limitadores, cuerpo, respuesta y errores |

`api.md` no se puede quedar viejo sin que se note: `backend/tests/contrato.api.test.ts` lo compara
con los routers montados y falla si aparece un endpoint sin documentar, si sobra uno o si la auth
escrita no es la real. Un endpoint nuevo se documenta en el mismo cambio.

---

## `cambios/` · qué se tocó y por qué

Un documento por bloque de trabajo cerrado. No es un changelog de commits: recoge las decisiones
que costaron y lo que quedó a medias, que es lo que no se puede reconstruir leyendo el diff.

| Documento | Qué es |
|---|---|
| `f6-seguridad.md` | Bloque F6, 4 de septiembre. Verificación del `id_token`, proxy cerrado, `$regex` escapado, 404 en JSON |
| `f7-rendimiento.md` | Bloque F7, 4 de septiembre. Índices en Mongo, el feed ordenado en la base, escrituras atómicas y las imágenes fuera de Mongo (F7.4, migrado: 6,72 MB → 0,24 MB) |
| `revision-produccion.md` | Revisión de producción del 16 de septiembre y todo lo que salió de ella hasta el 18: alérgenos que el detector no veía, la paginación de comentarios, el 401 de Pexels, las fotos huérfanas en Cloudinary, el recálculo ejecutado en Atlas, la limpieza de recetas de prueba y la verificación de los filtros del feed. REV-009 sigue abierto |

---

## `decisiones/` · por qué así y no de otra manera

Una ficha por decisión que alguien podría deshacer sin saber que se pensó: contexto, qué se eligió,
qué se descartó y qué obliga a partir de ahí. Se numeran en orden y no se reescriben; si una decisión
cambia, se escribe una ficha nueva que diga cuál sustituye.

| Documento | Qué es |
|---|---|
| `0001-detalle-receta-publico.md` | 30 de septiembre. El detalle de receta se ve sin sesión; me gusta, guardar, comentar y la despensa mandan al login |
| `0002-correo-por-http.md` | El correo sale por la API REST de Mailjet porque Render bloquea SMTP. Por qué Mailjet y no otro no está escrito |
| `0003-alergenos-como-suelo-en-el-backend.md` | Los alérgenos del perfil se aplican siempre y los aplica el backend; el query solo suma |
| `0004-doble-token.md` | La sesión de NextAuth lleva dentro el JWT del backend. El motivo de descartar las alternativas no está escrito, y la ficha lo dice |
| `0005-e2e-fuera-del-bloqueo-del-deploy.md` | Los E2E corren en el CI pero no están en el `needs` del deploy, porque son inestables |
| `0006-redis-con-respaldo-en-memoria.md` | Limitadores, tope de Gemini y cachés de IA: Upstash si está configurado, memoria si no |
| `0007-imagenes-en-cloudinary.md` | 4 de septiembre. Cloudinary frente a R2, y subida directa desde el navegador con firma del backend |

Las fichas 0002 a 0006 se escribieron el 4 de octubre sobre decisiones que ya estaban tomadas y
solo vivían en `CLAUDE.md`. Donde el motivo no estaba escrito en ningún sitio, la ficha lo dice en
vez de inventarlo. Faltan dos, que no se escriben hasta que la decisión exista: la búsqueda difusa
(F15) y qué se guarda al importar una receta ajena (F12.1).

---

## `diseno/` · cómo tiene que verse

| Qué | Dónde |
|---|---|
| Maquetas de las pantallas, con captura y HTML | `stitch/`, una carpeta por pantalla |
| Wireframes | `wireframes/`, tres PDF |
| Casos de uso | `casos-de-uso.html` |
| Pruebas de interfaz | `pruebas-ui.pdf` |
| Rediseño del formulario de crear receta | `formulario-crear-receta.md` |

Material de marzo, salvo `formulario-crear-receta.md`, que es del 18 de septiembre y compara cuatro
maneras de plantear el alta de receta (arreglar lo que hay, asistente por pasos, editor con
previsualización en vivo, bento editable) con las referencias y las pegas de accesibilidad de cada una.

El resto sigue valiendo como referencia visual, pero donde el código y la maqueta no coincidan, manda
el código.

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
