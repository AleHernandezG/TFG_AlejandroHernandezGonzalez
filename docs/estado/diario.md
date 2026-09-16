# Diario de trabajo

Una entrada por sesión, de arriba abajo la más reciente primero. Tres cosas en cada una: qué se
hizo, qué decisión costó tomar y qué queda a medias. Sirve para que la sesión de dentro de tres
semanas no reconstruya el razonamiento desde el `git log`.

---

## 2026-09-17 · La revisión de producción y sus arreglos

**Qué se hizo.** F6 y F7 se desplegaron el 16. Ese mismo día se aplicó la migración de comentarios
(36 comentarios de 26 recetas a su propia colección, con la copia de `respaldar.js` hecha antes) y
`GEMINI_MODEL` pasó a `gemini-3.6-flash` en Render, porque `gemini-2.5-flash` ya respondía 404. Por la
tarde, revisión completa de producción con Playwright y la cuenta de pruebas del seed: 18
comprobaciones bien y 4 fallos.

El 17 se arreglaron los cuatro, los detalles menores y otras tres cosas que salieron al volver a
probar en local. El fallo serio era de salud. «Tortellini al Pesto Genovese Clásico» lleva dos quesos
y solo estaba marcada con frutos secos, así que un alérgico a los lácteos la veía en el feed. El
detector del formulario solo reconocía nombres exactos y el backend guardaba lo que le mandara el
cliente. Ahora el detector entiende plurales, tildes y nombres largos, el backend recalcula los
alérgenos al crear y al editar, y `npm run recalcular:alergenos` corrige los que ya están guardados.

Lo demás era de menos riesgo: la hoja de comentarios no pedía la página 2, la vista previa de Pexels
iba sin token y daba 401, el contador de la cabecera no subía al comentar y borrar una receta dejaba
su foto en Cloudinary. Los tests pasan de 169 a 215. El detalle de cada arreglo está en
`docs/cambios/revision-produccion.md`.

**Qué decisión costó.** Dónde vive el detector. El backend lo necesita para no fiarse del cliente, pero
frontend y backend no comparten código y montar un paquete común por un solo fichero no compensaba.
Se copia, y `tests/alergenos.deteccion.test.ts` transpila el fichero del frontend y se pone en rojo si
los dos lados dejan de detectar lo mismo. Una copia vigilada por el CI se puede mantener; una copia a
secas se desincroniza en dos meses.

La otra, qué hacer con los falsos positivos. «Pan sin gluten» marca cereales, y «Pasta de curry»
también. Se aceptan: tanto el backend como el script solo suman alérgenos y nunca quitan uno. A un
alérgico, una receta escondida de más le molesta; una de menos es justo lo que pasó con el Tortellini.

**Qué queda a medias.** Todo está en `develop`. Falta el merge a `main` y, con Render ya Live, pasar el
script contra Atlas, primero en seco y luego con `-- --apply`. Hasta entonces el Tortellini sigue
saliendo a quien es alérgico a los lácteos. Contra Atlas no se ha ejecutado nada desde aquí; los pasos
están en `REVISION_DESPLIEGUE.md`, parte 1.

De la parte 2 de esa checklist quedan cosas que necesitan manos: el login con Google con una cuenta
real, escanear un ticket con la cámara del móvil, los índices en mongosh, los logs de Gemini en Render,
editar una receta ajena y borrar de Cloudinary las dos imágenes que dejó la revisión. La contraseña de
la cuenta de pruebas del seed está publicada en el repositorio y sigue entrando en producción.

F8.2 sigue abierta (las alergias del perfil aceptan cualquier texto) y M5 va por la mitad:
`/editar-receta` ya está en el `matcher` y `/completar-perfil` no.

---

## 2026-09-04 · El informe de mejoras entra en el plan

**Qué se hizo.** Llegaron a `docs/` tres ficheros generados con otra herramienta:
`informe_auditoria_mejoras.md`, `presentacion_cookr.html` y el `.webp` que los acompaña. Traen un
catálogo de once funcionalidades y cinco mejoras técnicas. Se cruzó todo con el código y con
`plan-2026-09.md` para quedarse solo con lo que faltaba.

Al plan se le añadieron seis bloques: F7.5 (comentarios a su propia colección, hallazgo M7), F7.6
(cuota de Gemini y caché de IA en Redis, hallazgo A6), F13 (streaming SSE), F14 (normalización de
unidades y resta de despensa), F15 (búsqueda difusa) y el F12 de producto reescrito entero en tres
tandas. M7 y A6 estaban en la auditoría desde el principio y se habían quedado fuera del plan.

**Qué decisión costó.** Qué hacer con el tono del informe. Da por implementadas cuatro cosas que no
existen (SSE, fuzzy, caché de IA en Redis, unidades) y dice 80 tests cuando hay 123. No se reescribe
el documento: se deja como catálogo de producto, que es para lo que sirve, y el aviso queda en la
cabecera del plan y en `docs/README.md`. Lo único que se tocó de él es el enlace de la animación,
que apuntaba a una ruta absoluta de otra máquina.

La otra: el orden. El informe trae un cronograma con fechas del 5 al 30 de septiembre que no
respeta las dependencias entre bloques (mete features encima de la despensa sin normalizar). Manda
la tabla del final del plan; las fechas no se copian.

**Qué queda a medias.** Nada de este trabajo. F7.4 (Cloudinary) se estaba haciendo en otra sesión en
paralelo y no se tocó ni un fichero de `backend/`. De lo que entra nuevo, F14 es lo que más tapona:
casi todo F12 lo necesita.

---

## 2026-09-04 · Hito: Fin de defensa de TFG y transición a Producto Personal

**Qué se definió.** La defensa académica del TFG ha concluido con éxito. El proyecto Cookr deja de tratarse como un trabajo académico/TFG y pasa a ser oficialmente un **proyecto personal / producto de producción independiente**. 

Ya no hay tribunal ni compromisos académicos que condicionen las decisiones. Todo el enfoque pasa a centrarse en:
- **Seguridad en producción y fiabilidad real** (resolución inmediata de C1, A1, A2).
- **Rendimiento y arquitectura escalable** (índices MongoDB, consultas agregadas y almacenamiento externo de medios en Cloudinary/R2).
- **Experiencia de usuario y valor de producto real** (planificador semanal, lista de compra inteligente, modo cocina manos libres, PWA).
- **Costes y cuotas eficientes** (gestión del proxy de Gemini y límites en Redis).

---

## 2026-09-04 · Auditoría completa y plan de trabajo

**Qué se hizo.** Auditoría del repositorio entero antes de seguir tocando nada. Se comprobó
ejecutando, no leyendo: lint y tipos limpios en los dos paquetes, 80 de 80 tests en verde, cero
secretos en el historial completo, `develop` y `main` al mismo commit. Encima de esa base salieron
25 hallazgos: 1 crítico, 6 altos, 10 medios y 8 bajos.

El crítico es que `POST /api/auth/google` no verifica nada. Acepta `googleId` y `correo` en el
cuerpo y devuelve un JWT de 7 días, así que con el correo de cualquier usuario se entra en su
cuenta; y si la cuenta era local con contraseña, además la vincula al `googleId` recibido. Está en
producción.

Cuatro documentos nuevos: `docs/estado/auditoria-2026-09.md` (hallazgos con fichero, línea y arreglo),
`docs/estado/plan-2026-09.md` (bloques F0 y F6 a F12 con criterio de cierre comprobable), `docs/referencia/metodo-cookr.md`
(qué se coge del método de DietMetric y qué no) y `README.md` como índice de `docs/`, que tenía 44
documentos sin nada que dijera cuál seguía vigente.

**Qué decisión costó.** El correo. El plan de julio era comprar un dominio y alinearlo en Mailjet;
se descarta y se envía desde Gmail asumiendo que Outlook y Hotmail lo descartan en silencio por
DMARC. La decisión es consciente, pero arrastra una condición que no se puede olvidar: la
demostración de la defensa tiene que hacerse con una cuenta de Gmail.

La otra: no implementar ningún arreglo en esta sesión. El encargo era auditar y planificar antes
de seguir, y mezclarlo habría dejado el diagnóstico a medias.

**Qué queda a medias.** Todo el plan. Lo siguiente es el bloque F6 (seguridad) entero, empezando
por verificar el `id_token` de Google. El frontend ya tiene el token disponible en
`auth.ts:103` y manda `providerAccountId` en su lugar.

Sin cerrar tampoco: los cinco ADR de F10.4, uno de ellos el del correo que se decidió hoy; y
`TFG-DOcumenatacion/` y `ODCUTGF/` siguen fuera del control de versiones (el `.pptx` se descarta,
no importa).

Se instalaron los plugins `security-guidance`, `code-review`, `commit-commands` y `skill-creator`,
con la lista de permisos de F11. `typescript-lsp`, `context7` y `playwright` ya estaban activos a
nivel global.
