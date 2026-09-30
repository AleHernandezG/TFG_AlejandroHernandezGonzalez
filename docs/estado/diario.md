# Diario de trabajo

Una entrada por sesión, de arriba abajo la más reciente primero. Tres cosas en cada una: qué se
hizo, qué decisión costó tomar y qué queda a medias. Sirve para que la sesión de dentro de tres
semanas no reconstruya el razonamiento desde el `git log`.

---

## 2026-09-30 · F8 cerrado: el código cumple lo que dice `CLAUDE.md`

**Qué se hizo.** Los cuatro puntos de F8, en la rama `fix/cerrar-f8`.

Zod en todas las rutas con cuerpo, incluidos el chat, `escanear-ticket` y `generar-desde-texto`, que
no estaban en la lista pero validaban a mano igual. Los controladores dejan de importar Zod: los tipos
salen de `validadores.ts` con `z.infer`. Las reglas y los mensajes son los de antes, comprobados uno a
uno. Lo único que cambia hacia fuera es que los 400 de recetas traían `detalle` y ahora traen
`errores`, como el resto; `usePerfil` se adapta para enseñar el primer mensaje. 43 tests nuevos,
329 en total.

Las alergias del perfil y las preferencias solo admiten los 14 ids. El frontend ya mandaba ids, así
que ahí no hubo nada que tocar. Para lo que hay guardado, `npm run normalizar:alergias`: traduce
«gluten» a `cereales`, «lactosa» a `lacteos` y compañía, deja copia antes de escribir, sabe deshacerse
con `--restaurar` y lista lo que no entiende sin borrarlo. Probado contra un Mongo efímero con perfiles
inventados: en seco no toca nada, aplicado arregla lo que debe y la segunda pasada sale limpia.

Los `.env.example`, contra un grep de todos los `process.env`, y después de verdad: clon en una carpeta
limpia, `npm ci`, plantillas copiadas y a arrancar. Las plantillas tal cual no arrancan el backend
(`EBADNAME`, el `MONGODB_URI` de ejemplo no existe), cosa esperable. Con Mongo y `JWT_SECRET` rellenos
arranca todo, pero el registro sin Mailjet deja una cuenta que no puede entrar. Está escrito en
`CLAUDE.md`.

El detalle de receta pasa a ser público, con ADR (`docs/decisiones/0001`) y un E2E nuevo a 1440 y a
390 que abre una receta sin sesión y prueba que cada acción lleva al login sin ningún 401.

**Qué decisión costó tomar.** Dos.

El `enum` de Mongoose que pedía F8.2. Ponerlo hoy haría que un usuario con «gluten» guardado no
pudiera cambiar ni la foto, porque Mongoose valida el documento entero al guardar. Así que el enum
espera a que la normalización haya pasado por Atlas. La validación de entrada sí va ya, y eso tiene un
coste: el panel de preferencias reenvía lo que tenga el perfil, así que un perfil antiguo da 400 hasta
que se normalice. Por eso la normalización va justo después del despliegue y no otro día.

Qué hacer cuando un visitante pulsa «me gusta». Esconder los botones dejaba la página coja y no
invitaba a nada; dejarlos como estaban era un 401 en silencio, y en la despensa además un «✓ Añadidos»
mentiroso. Se quedan visibles y mandan al login con `callbackUrl`. Mientras la sesión carga, el clic no
hace nada: es mejor perder un clic que mandar al login a alguien que ya ha entrado.

**Qué queda a medias.** Commitear y subir; lo lanza Alejandro. La normalización contra Atlas, en seco y
luego con `-- --apply`, cuando Render esté Live. Después, el `enum` en `usuarioMongo.ts`. Y el login,
que no respeta el `callbackUrl`: el visitante entra y acaba en `/home`, no en la receta. Arreglarlo
pide validar que el destino es una ruta interna.

---

## 2026-09-29 · Los limitadores de auth cuentan por la IP del usuario

**Qué se hizo.** Primero medir. Con el diagnóstico del 28 ya desplegado, `/api/health` en producción
enseñó que la cadena es navegador → Cloudflare → balanceador interno de Render → Express, con una
`X-Forwarded-For` del tipo `cliente, edge de CF, 10.x`. Con `trust proxy 1`, `req.ip` era ese `10.x`,
y en varias decenas de peticiones solo salieron unos tres valores distintos. Es decir, toda la web
compartía tres cubos: unas 15 altas por hora para todo el mundo, y cualquiera con diez contraseñas
mal podía dejar sin login a un tercio de los usuarios durante 15 minutos. La parte buena: suplantar
no funcionaba. Una `X-Forwarded-For` falsa se queda a la izquierda y no cambia `req.ip`, una
`CF-Connecting-IP` falsa la corta Cloudflare con el error 1000 y `True-Client-IP` la sobrescribe.

El arreglo es `ipDelCliente()` en `backend/src/lib/ipCliente.ts`, que es lo que usa ahora el
`keyGenerator` de todos los limitadores de `rateLimitAuth.ts`, pasado por `ipKeyGenerator` para que
una IPv6 cuente por subred. El diagnóstico de `/api/health` se va y vuelve a su forma de siempre.

**Qué decisión costó tomar.** Qué hacer con el login y con Google. Esas dos llamadas no salen del
navegador sino del servidor de Vercel, dentro de NextAuth, así que su `cf-connecting-ip` es la de
Vercel y seguirían todos en el mismo cubo. Subir `trust proxy` no servía de nada, porque el problema
no es cuántos saltos hay sino quién hace la petición. Se eligió que NextAuth reenvíe la IP que Vercel
le da (`x-real-ip`, que Vercel sobrescribe y no se puede falsear) en `x-client-ip`, junto con un
secreto compartido, `CLIENT_IP_TOKEN`. El backend solo se la cree si el secreto coincide; si no, pasa
a `cf-connecting-ip` y después a `req.ip`. La comparación va con `timingSafeEqual` sobre un SHA-256
para no filtrar la longitud.

Probado con 12 tests nuevos (286 en total) y de punta a punta en local, con el backend E2E y
`next dev` compartiendo token: diez logins fallidos por NextAuth con `x-real-ip` A, el undécimo da
429, y la IP B sigue entrando mientras A está bloqueada.

Por la tarde, desplegado con los PRs #49 y #50 y `CLIENT_IP_TOKEN` en los dos lados. En producción,
el cupo baja de uno en uno desde la misma IP, una `x-client-ip` con token inventado se ignora y un
login fallido por NextAuth cae en el mismo cubo que uno directo. B7 queda cerrado en su parte de proxy.

**Qué queda a medias.** La prueba de `pruebas-manuales.md` con dos redes de verdad (móvil con datos y
wifi), que desde una sola máquina no se puede hacer. La fuga de handles de Jest del CI sigue sin
reproducirse.

---

## 2026-09-28 · Ola 2 de la interfaz y diagnóstico de trust proxy

**Qué se hizo.** Un solo PR para dos cosas, por no encadenar despliegues. La primera es la ola 2 de
`revision-ui-2026-09.md`: un solo árbol por pantalla (UI-005), un solo `<main>` (UI-009), landmarks y
encabezados (UI-009b), los chips de categoría de Discover conectados (UI-012) y los cuatro arreglos de
accesibilidad que axe no ve: enlace de salto, anillo de foco global, `MotionConfig` y el
`aria-describedby` de los alérgenos fijos. Revisado en local con Playwright a 1440 y 390 contra un Mongo
efímero sembrado a mano.

La segunda es temporal: `/api/health` devuelve `req.ip`, `req.ips` y las cabeceras de proxy
(`X-Forwarded-For`, `CF-Connecting-IP`, `True-Client-IP`). Sirve para saber, con la versión desplegada
detrás de Cloudflare y Render, qué IP ve de verdad el limitador de login con `trust proxy` a 1, y si
una `X-Forwarded-For` falsa la cambia. Se quita en el siguiente PR, que es el que trae el arreglo.

**Qué decisión costó tomar.** Cómo hacer que `?categoria=Postres` funcione. El regex con `i` era una
línea y rompía el índice del feed; se normaliza el valor a igualdad exacta con `canonizarCategoria`.
Y en el drawer, `aria-disabled` en vez de `disabled`, para que el aviso del candado llegue a leerse.
UI-006 entró al final, con visto bueno: `--brand-texto` para todo el texto naranja, salvo los tres
títulos que van encima de una foto oscurecida, donde oscurecer el tono habría bajado el contraste.

**Qué queda a medias.** Medir el diagnóstico en producción y en develop, y con eso decidir el arreglo
de trust proxy. La fuga de handles de Jest que salía en el CI no se
reproduce en local: 274 tests con `--detectOpenHandles` sin ningún handle abierto y seis ejecuciones
seguidas sin el aviso. No se ha tocado nada, y menos `forceExit`, que la escondería sin arreglarla.

---

## 2026-09-18 · Cierre del ciclo de producción y revisión de interfaz

**Qué se hizo.** Empezó comprobando que el merge estuviera desplegado y acabó siendo una revisión
larga. El PR #35 (`8bcb793`) estaba en `main` y servido, así que se verificaron los seis arreglos en el
sitio real, uno a uno, con Playwright sobre `tfg-alejandro-hernandez-gonzalez.vercel.app`. Los seis
bien. Después, el recálculo de alérgenos contra Atlas: en seco primero, y con `--apply` corrigió 27
recetas de 145 dejando copia. Con eso REV-001 queda cerrado de verdad.

Al probar salieron dos fallos nuevos. Un comentario recién publicado decía «hace -1 min», porque la
hora del servidor va unos segundos por delante de la del navegador y la resta salía negativa; y
`tiempoRelativo` estaba escrita tres veces en tres ficheros distintos, con tres formatos. Ahora vive
en `lib/tiempo.ts`, con un `Math.max(0, …)` delante (REV-007). El otro: al enviar el formulario de
crear receta sin elegir dificultad, el error salía en inglés, «Dificultad: Invalid input», porque zod 4
cambió `invalid_type_error` por `error` y ese campo se quedó sin migrar (REV-008).

Se borraron las dos recetas de prueba que llevaban meses en producción, las dos «Macarrones con
tomate», con descripciones tipo `AFASFASAFDASAF`. Ninguna tenía comentarios ni estaba guardada. La
colección pasa de 145 a 143. Los siete comentarios de relleno de «Bowl de Atún y Arroz Estilo Sushi»
se quedan a propósito: son los que hacen que esa receta pase de ocho comentarios y son el caso de
prueba de la paginación de REV-002.

Después, el encargo grande: revisar la interfaz entera. Salieron doce puntos, en
`docs/estado/revision-ui-2026-09.md`. El del espacio desaprovechado en escritorio resultó ser tres
fallos distintos y no uno. El ciclo de variantes del feed bento suma 11 celdas en una rejilla de 3
columnas, así que cada siete tarjetas queda un hueco literal. La tarjeta grande lleva `flex-grow` y
`justify-between` dentro de un `row-span-2`, y eso le abre una franja muerta en medio. Y cuatro de las
cinco páginas de escritorio encierran el contenido en 512 u 768 px dentro de un área de 1184.

El peor hallazgo no era de maquetación. Los botones de me gusta y de guardar del feed de escritorio
solo tocan estado local: animan, cambian el número y anuncian `aria-label="Dar like"`, y no mandan nada
al backend. Al recargar, todo vuelve atrás.

Por último, los filtros. 37 peticiones a la API de producción: el backend filtra bien, sin
excepciones. Lo que está mal son los datos. Hay cuatro recetas etiquetadas `vegetariana`, `vegana`,
`sin lactosa` y `sin gluten (verificar ingredientes)`, categorías que no existen en `DIETAS_OPCIONES`,
así que no aparecen en ningún filtro de dieta ni puntúan en el feed personalizado. Vienen todas de
«Crear desde descripción»: el prompt de Gemini pide `"dietas": string[]` sin enumerar cuáles, el
validador acepta cualquier cadena y el repositorio lo guarda tal cual. Queda como REV-009, sin
arreglar.

Tres documentos nuevos de diseño: `docs/diseno/formulario-crear-receta.md`,
`docs/estado/pwa.md` y `docs/estado/eventos.md`.

**Qué decisión costó.** Cómo arreglar el hueco del bento. La salida fácil es
`grid-auto-flow: dense`, que rellena los huecos sola, pero deja el orden visual distinto del orden del
DOM, y entonces el lector de pantalla y el tabulador recorren el feed por un camino que no es el que se
ve (WCAG 2.4.3 y 1.3.2). Se descarta. Quitando el `row-span-2` de la tarjeta grande el ciclo baja a 9
celdas y encaja solo, sin tocar el orden de nada.

La otra, qué recomendar para el formulario de crear receta. La idea del bento editable es la más
bonita y la que peor se porta: convierte el orden de tabulación en un laberinto y esconde qué campos
existen, que es justo lo que no puede pasar en un formulario que se usa dos veces al mes. Gana el
editor con previsualización al lado, sobre todo porque `previsualizacionReceta.tsx` ya existe y ya
pinta la receta: es moverlo de ruta, no escribirlo.

**Qué queda a medias.** REV-009 sin tocar: hay que enumerar las dietas en el prompt, cerrar el
validador con un `z.enum` y migrar las cuatro recetas. Toca IA, validación y datos a la vez, y quiere
sus propios tests.

De la revisión de interfaz no se ha implementado nada, es solo el documento. Lo primero de la lista son
los dos `<select>` sin nombre accesible y los likes de escritorio que no persisten, que son fallo
funcional y no estética.

Y el evento falso sigue en producción: la tarjeta de Discover anuncia una «Semana de la Cocina
Mediterránea» que no existe, no se puede pulsar, y no tiene nada que ver con las 6 recetas marcadas
como de evento. Quitar el mock es media hora; hacer eventos de verdad son cuatro jornadas y está
planteado en `docs/estado/eventos.md`.

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

**Qué queda a medias.** *(Resuelto esa misma noche, ver la entrada del 18.)* El merge a `main` entró
como PR #35 (`8bcb793`), Vercel y Render lo sirvieron, y el recálculo de alérgenos se pasó contra
Atlas en seco y luego con `-- --apply`: 27 recetas corregidas de 145, con copia previa en
`backend/respaldos/alergenos-2026-09-17T19-09-52-790Z.json`. El Tortellini ya no le sale a quien es
alérgico a los lácteos.

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
