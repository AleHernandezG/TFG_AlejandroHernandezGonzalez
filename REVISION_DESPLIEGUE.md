# Revisión del despliegue

Checklist para llevar `develop` a `main` y comprobar después que funciona. Marca cada casilla cuando
la compruebes.

La parte 1 es el despliegue que toca ahora: lo que se arregló el 17/09/2026 a partir de la revisión de
producción del día anterior. La parte 2 es la de F6 y F7, que ya está desplegada. Se queda como
referencia y con lo que falta por mirar de ella.

| Qué | URL |
|---|---|
| Frontend | https://tfg-alejandro-hernandez-gonzalez.vercel.app |
| Backend | https://tfg-alejandrohernandezgonzalez.onrender.com/api |
| Worker de Gemini | https://gemini-proxy.alejes.workers.dev |

`cookr.vercel.app` no es Cookr, es otra aplicación que se llama igual. No pruebes nada ahí.

---

# Parte 1 · Correcciones de la revisión de producción

Escrita el 17/09/2026. El detalle de cada arreglo, con el porqué, está en
`docs/cambios/revision-produccion.md`.

## Qué entra

Hay dos commits que se quedaron en `develop` después del merge de F6 y F7. `bd07a7c` cambia el modelo
de Gemini por defecto a `gemini-3.6-flash`; en producción no se nota, porque `GEMINI_MODEL` ya vale eso
en Render. `30b7b66` solo toca esta checklist. El que importa es el tercero, el de las correcciones.
De cara a producción cambia esto:

- Las recetas se guardan con los alérgenos que llevan sus ingredientes, los marque el autor o no, y el
  detector entiende plurales, tildes y nombres largos como «Queso Parmigiano Reggiano rallado».
  **Las recetas que ya están en Atlas no se corrigen solas: necesitan el script del apartado 3.**
- La hoja de comentarios carga las páginas siguientes al bajar.
- Al crear una receta sin foto, la vista previa enseña la de Pexels (antes daba 401).
- El número de comentarios de la cabecera sube al comentar, sin recargar.
- Borrar una receta o cambiarle la foto borra la imagen anterior de Cloudinary.
- `PUT /api/usuarios/me/foto` pasa por Zod y rechaza lo que no sea una URL `https://`.
- Categorías con su nombre («Alto en proteínas»), diálogos sin aviso de Radix en consola, mensajes en
  español con el tiempo o las porciones vacíos, foto de respaldo cuando una receta no tiene
  `imagenUrl` y `/editar-receta` dentro del `matcher`.

Comprobado el 17/09/2026, antes del merge:

- En local, 215 tests del backend en verde (eran 169) y lint y tipos limpios en los dos paquetes.
- Recorrido con Playwright contra un backend local con Mongo en memoria: los cuatro fallos y los
  detalles, uno a uno.
- El script de alérgenos, contra otro Mongo en memoria: en seco, `--apply`, segunda pasada a 0 y
  `--restaurar`.

Contra Atlas no se ha ejecutado nada.

## 1. Antes del merge

- [ ] CI de `develop` en verde con el último commit.
- [ ] `CLOUDINARY_URL` sigue en Render → Environment. Sin ella no se puede subir ninguna foto, y
      además borrar una receta dejaría su imagen en Cloudinary sin avisar.

No hay variables nuevas en Render ni en Vercel, y el Worker no cambia. Tampoco hace falta
`respaldar.js`: el script de alérgenos guarda su propia copia antes de escribir.

## 2. El merge

- [ ] PR de `develop` a `main`, con `ci-frontend` y `ci-backend` en verde.
- [ ] Merge.
- [ ] Vercel → Deployments: el de `main` está en **Ready**.
- [ ] Render → Events: el deploy acaba en **Live**, con `✅ MongoDB conectado` en los logs.

No pases el script hasta ver el Live. Una receta creada mientras tanto la guarda el backend viejo sin
recalcular, y el script solo corrige lo que ya está guardado cuando se ejecuta.

## 3. Recalcular los alérgenos de las recetas guardadas

Desde `backend/`, con el `.env` que apunta al Atlas de producción. Primero en seco:

```bash
npm run recalcular:alergenos
```

Saca una línea por receta a la que le faltan alérgenos, con los que tiene entre corchetes y los que
añadiría detrás del `+`, y un resumen por alérgeno.

- [ ] «Tortellini al Pesto Genovese Clásico» está en la lista y entre lo que suma va `lacteos`.
- [ ] Nada de la lista es absurdo. Hay falsos positivos aceptados: «Pan sin gluten» y «Pasta de
      curry» marcan cereales. Si ves algo que no sea de ese tipo, para antes de aplicar.
- [ ] Si sale un `⚠️` con recetas que guardan alérgenos fuera de la lista de 14, apúntalo. No bloquea:
      el script no las toca, y es el hallazgo M2 de la auditoría.

Luego, de verdad:

```bash
npm run recalcular:alergenos -- --apply   # el -- es obligatorio o npm se come el argumento
```

- [ ] Sale `💾 Copia de los alérgenos de antes en respaldos\alergenos-<fecha>.json`. Apunta esa ruta.
      La carpeta `backend/respaldos/` no se sube a git, así que esa copia solo está en tu equipo.
- [ ] Acaba con `✅ Ninguna receta tiene ya alérgenos sin declarar.`
- [ ] Una segunda pasada en seco dice `Recetas a las que les faltan alérgenos: 0`.
- [ ] En mongosh:

```js
db.recetas.findOne({ _id: ObjectId("6a3b171979a80ae6b1f988ed") }, { titulo: 1, alergenos: 1 })
// alergenos lleva frutosSecos, que ya tenía, y ahora también lacteos
```

**Deshacer.** El propio `--apply` imprime el comando al final:

```bash
npm run recalcular:alergenos -- --restaurar "respaldos\alergenos-<fecha>.json"
```

Deja los alérgenos de cada receta de la copia como estaban, y las recetas creadas después no se tocan.
Úsalo solo si el script ha hecho algo claramente mal: restaurar devuelve el Tortellini a quien es
alérgico a los lácteos.

## 4. La aplicación, a mano

Recarga forzada (Ctrl+F5) antes de empezar.

### Alérgenos

- [ ] El detalle del Tortellini (`/recetas/6a3b171979a80ae6b1f988ed`) enseña lácteos entre sus
      alérgenos.
- [ ] Con una cuenta alérgica a los lácteos, el Tortellini no sale en el feed.
- [ ] En `/crear-receta`, un ingrediente «Queso parmesano rallado» sale con lácteos en la
      previsualización. Si publicas, la receta los guarda. Bórrala al terminar.

### Comentarios

- [ ] En `/recetas/6a0ac90ca77fabe17a12550b`, «Ver los 9 comentarios» y bajar hasta el final. En la
      pestaña de red sale `comentarios?pagina=2` y la hoja acaba en «Has visto todos los comentarios».
- [ ] Al comentar, el número junto al icono de la cabecera sube sin recargar.

### Crear receta

- [ ] Sin foto propia, la previsualización enseña una foto de Pexels, y
      `GET /api/recetas/foto-preview` da 200.
- [ ] Al revisar una receta con foto propia no sale ninguna petición a `foto-preview`.
- [ ] Vaciar el tiempo o las porciones da un mensaje en español.

### Cloudinary

- [ ] Crea una receta de prueba con foto propia y apunta el nombre del fichero en `cookr/recetas/`.
      Bórrala. En la Media Library ya no está, y en los logs de Render no sale
      `[Cloudinary] No se pudo borrar la imagen`.

### Lo demás

- [ ] Una receta con la categoría de proteínas enseña «Alto en proteínas», no `ALTOENPROTEINAS`.
- [ ] En incógnito, `/editar-receta/6a3b171979a80ae6b1f988ed` lleva al login.
- [ ] Con la consola abierta, abrir los filtros del feed y el diálogo de cambiar contraseña no da el
      aviso de Radix sobre `Description`.

## Si algo sale mal

| Síntoma | Causa probable |
|---|---|
| El script no encuentra el Tortellini o revisa muy pocas recetas | El `.env` de `backend/` no apunta al Atlas de producción |
| El Tortellini sigue sin lácteos en la web tras el `--apply` | Caché del navegador: Ctrl+F5. Si mongosh también lo dice, el `--apply` no llegó a escribir |
| La hoja de comentarios sigue parándose en 8, o `foto-preview` da 401 | Vercel todavía sirve el deploy anterior |
| Log `[Cloudinary] No se pudo borrar la imagen` | Cloudinary no respondió o `CLOUDINARY_URL` no vale. La receta se borró igual; la foto, a mano |
| La foto sigue en Cloudinary y no hay ningún log | `CLOUDINARY_URL` no está en Render, o la receta tenía foto de Pexels |
| 400 al cambiar el avatar | Llega algo que no es una URL `https://`. Es el comportamiento nuevo; si pasa con una subida normal, es un fallo |

**Volver atrás.** Rollback en Render → Events y en Vercel → Deployments, igual que en la parte 2. Los
alérgenos añadidos no hay que quitarlos: el código viejo los lee igual y siguen siendo correctos.

---

# Parte 2 · F6 y F7

Escrita el 16/09/2026 y **desplegada ese mismo día**. Ese día también se aplicó la migración de
comentarios y se cambió `GEMINI_MODEL` a `gemini-3.6-flash` en Render. La revisión con Playwright de
esa tarde dio por buenos los apartados 3 y 4 salvo lo que arregla la parte 1.

Quedan sin comprobar, y necesitan tus manos:

- [ ] Login con Google con una cuenta real.
- [ ] Escanear un ticket con una foto de cámara desde el móvil.
- [ ] Con sesión, abrir `/editar-receta/<id>` de una receta de otro usuario: no deja editarla. El
      código lo bloquea en la página y en el backend, pero la prueba no llegó a devolver resultado.
- [ ] Los índices en mongosh (apartado 3).
- [ ] En los logs de Render, `[Gemini guard] llamada N/1000 de hoy (redis)` y
      `[Gemini cache] HIT pregunta` tras repetir una pregunta.
- [ ] Borrar a mano de Cloudinary las dos imágenes que dejó la revisión:
      `cookr/recetas/6a0ac90ba77fabe17a1254e7-1789558365899-a0532788.png` y
      `cookr/avatares/6a0ac90ba77fabe17a1254e7.png`.

Lo de abajo es la checklist tal como se usó.

## Qué entraba y cómo estaba producción

Diez commits. De cara a producción cambia esto:

- El login con Google verifica el `id_token` contra Google. Hoy `POST /api/auth/google` acepta
  `googleId` y `correo` sin comprobar nada, así que con el correo de otra persona se entra en su
  cuenta. Es el hallazgo C1 y sigue abierto en producción hasta este merge.
- El proxy de Gemini falla cerrado si le falta `PROXY_TOKEN` y solo reenvía `/v1beta/models/`.
- La búsqueda del feed se escapa, los 404 salen en JSON y los 500 no enseñan el error interno.
- Mongo tiene índices y el feed se ordena en la base de datos, no en Node.
- Likes y guardados son atómicos: ni likes duplicados ni guardados perdidos con peticiones a la vez.
- Las fotos van del navegador a Cloudinary con una firma del backend, y en Mongo solo queda la URL.
  Las fotos antiguas ya se migraron el 04/09/2026.
- La cuota diaria de Gemini y las cachés de IA viven en Upstash y sobreviven a un reinicio. Hay caché
  nueva para preguntas repetidas.
- Los comentarios pasan a su propia colección, con paginación de verdad. **Necesita migración.**

Comprobado el 16/09/2026, antes del merge:

- CI de `develop` en verde en `353362b`, con el job `e2e` incluido.
- En local, 169 tests del backend en verde y lint y tipos limpios en los dos paquetes.
- Producción sirve el código del 04/08/2026: `/api/subidas/firma` da 404 y los 404 salen en el HTML
  de Express.
- El Worker responde 403 sin cabecera, o sea que `PROXY_TOKEN` está puesto.

---

## 1. Antes del merge

### Render → Environment

Guardar variables relanza el código que ya está en `main`. No pasa nada: el código viejo ignora las
que no conoce.

- [ ] `CLOUDINARY_URL`, con el mismo valor que en `backend/.env` (cloud `lphsxuxk`). Sin ella, elegir
      una foto da 503 y no se puede crear una receta con imagen propia.
- [ ] `UPSTASH_REDIS_URL` y `UPSTASH_REDIS_TOKEN`. La URL es la REST, la que empieza por `https://`.
      Si reutilizas la base de `backend/.env`, el contador diario de Gemini se comparte entre local
      y producción.
- [ ] `GOOGLE_CLIENT_ID` está y vale exactamente lo mismo que en Vercel. Se puso el 04/09/2026; si
      falta, `/api/auth/google` responde 503 en cuanto despliegue.
- [ ] `GEMINI_BASE_URL` y `GEMINI_PROXY_TOKEN` siguen puestas. Este merge no las toca, pero el chat
      depende de ellas.

En Vercel no hay variables nuevas.

### El Worker de Gemini

El CI no lo despliega.

- [ ] En Cloudflare → Workers & Pages → `gemini-proxy` → Deployments hay un despliegue del
      04/09/2026 o posterior. Si no lo hay, desde `gemini-proxy/`:

```bash
npx wrangler login
npx wrangler deploy --keep-vars
```

`PROXY_TOKEN` existe: el Worker viejo solo responde 403 si la tiene definida. Lo que no se sabe es de
qué tipo es, y ahí está la trampa. Sin `--keep-vars`, wrangler borra las variables de texto plano que
no están en `wrangler.toml`, y los secretos no los toca nunca. Si `PROXY_TOKEN` se creó como *Text* en
el panel, un `deploy` a secas se la lleva y el código nuevo responde 500 a todo: el chat se cae.

Si wrangler avisa de que el Worker se editó por última vez desde el panel, acepta. Se pisan el código
y lo que diga `wrangler.toml`, y con `--keep-vars` las variables se quedan.

Sin instalar nada vale igual: en el panel, **Edit code**, pegar `worker.js` entero y **Deploy**.
Así las variables no se tocan.

- [ ] Con el valor de `GEMINI_PROXY_TOKEN` que hay en Render:

```bash
curl -i https://gemini-proxy.alejes.workers.dev/v1beta/models/gemini-3.6-flash
# 403 Forbidden: invalid proxy token

curl -i -H "x-proxy-token: EL_TOKEN" https://gemini-proxy.alejes.workers.dev/v1/otra-cosa
# 404 Ruta no permitida
```

Si la segunda devuelve un JSON de Google en vez de `Ruta no permitida`, el Worker sigue con el
código viejo.

### Copia de `recetas`

La migración de comentarios hace `$unset` del array de cada receta, y lo que había dentro no se
recupera del propio documento.

- [ ] Volcado hecho:

```bash
node "C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f75/respaldar.js"
```

No hace falta `mongodump`: el script usa el driver de `backend/node_modules` y el `MONGODB_URI` de
`backend/.env`, igual que la copia de F7.4 en `backup-antes-de-f74`. Deja `recetas.json` en EJSON.

---

## 2. El merge

- [ ] PR de `develop` a `main` en GitHub, con `ci-frontend` y `ci-backend` en verde sobre la PR.
- [ ] Merge. El push a `main` relanza el CI y, si pasa, el job `deploy` llama al hook de Render.
      Entre CI y build son unos 6 a 10 minutos.
- [ ] Vercel → Deployments: el de `main` está en **Ready**.
- [ ] Render → Events: el deploy acaba en **Live**, y en los logs sale `✅ MongoDB conectado` sin
      errores de índices.

Vercel publica en uno o dos minutos, bastante antes que Render. Mientras Render no termina, el
frontend nuevo habla con el backend viejo y fallan el login con Google, las fotos y los comentarios.
No es un fallo del deploy: espera al Live antes de probar nada.

---

## 3. Nada más desplegar

### El backend que responde es el nuevo

```bash
B=https://tfg-alejandrohernandezgonzalez.onrender.com/api
curl -s $B/health                   # {"estado":"ok","entorno":"production"}
curl -s $B/no-existe                # {"error":"Ruta no encontrada"}
curl -s -X POST $B/subidas/firma    # 401 Token de autenticación requerido (antes 404)
curl -s -X POST -H "Content-Type: application/json" -d '{}' $B/auth/google
                                    # 400 con el campo idToken (antes pedía googleId y correo)
```

- [ ] Las cuatro responden así.

### Migración de comentarios

En cuanto Render esté Live: hasta que se aplique, todas las recetas enseñan 0 comentarios. Tampoco
la adelantes al merge. El código viejo seguiría escribiendo dentro del array, y al repetir la
migración esos comentarios nuevos podrían perderse.

Desde `backend/`, con el `.env` que apunta al Atlas de producción:

```bash
npm run migrar:comentarios              # en seco, no escribe nada
npm run migrar:comentarios -- --apply   # el -- es obligatorio o npm se come el argumento
```

- [ ] La pasada en seco no lista comentarios ilegibles bajo un `⚠️`, o los has mirado en Atlas antes
      de aplicar. Al aplicar, esos se pierden.
- [ ] El `--apply` acaba con `✅ Ninguna receta conserva listaComentarios.`
- [ ] Los contadores cuadran con los documentos, en mongosh:

```js
db.recetas.countDocuments({ listaComentarios: { $exists: true } })                 // 0
db.recetas.aggregate([{ $group: { _id: null, n: { $sum: "$numComentarios" } } }])  // mismo número que
db.comentarios.countDocuments({})                                                  // este
```

- [ ] Un segundo `--apply` dice 0 movidos y deja los mismos números.

El detalle de cada paso está en `docs/estado/pruebas-manuales.md`, apartado 7.

### Índices

Mongoose los crea al arrancar. En mongosh:

```js
db.recetas.getIndexes()      // fechaPublicacion_-1, autorId_1_fechaPublicacion_-1,
                             // categorias_1_fechaPublicacion_-1, esEvento_1_fechaPublicacion_-1
db.usuarios.getIndexes()     // googleId_1, con sparse: true
db.comentarios.getIndexes()  // recetaId_1_fecha_-1__id_-1
```

- [ ] Están todos, con esos nombres.

### Upstash

- [ ] Hazle al chat una pregunta que no hayas hecho antes (las repetidas salen de caché y no llaman a
      Gemini). En los logs de Render aparece `[Gemini guard] llamada N/1000 de hoy (redis)`. Si pone
      `(memoria)`, las variables no han llegado al proceso.

---

## 4. La aplicación, a mano

Recarga forzada (Ctrl+F5) antes de empezar, que TanStack Query guarda datos viejos.

### Entrar

- [ ] Login con correo y contraseña.
- [ ] Login con Google con una cuenta real.

### Fotos

- [ ] Crear una receta con foto propia. Al **elegir** el fichero salen `POST /api/subidas/firma` → 200
      y la subida a `api.cloudinary.com` → 200. La receta publicada enseña la foto.
- [ ] En Atlas, esa receta tiene `imagenUrl` empezando por `https://res.cloudinary.com` y ningún
      `data:` dentro.
- [ ] Editarla cambiando solo el título. La foto sigue igual y no se pide firma nueva.
- [ ] Cambiar el avatar en `/perfil`. Sale en la cabecera y sigue ahí después de cerrar sesión y
      volver a entrar.

### Comentarios

- [ ] Una receta que ya tenía comentarios los enseña: vista previa, total junto al icono y el panel
      trayendo más al bajar.
- [ ] Un comentario nuevo aparece arriba sin recargar, y la tarjeta del feed da el mismo número que el
      detalle.

### Feed

- [ ] Home y discover cargan, con las recetas nuevas primero.
- [ ] Con una cuenta con alérgenos en el perfil no aparece ninguna receta que los lleve. El feed pasó
      a ordenarse en Mongo y esta regla es la que no se puede romper.
- [ ] Buscar `(a+)+$` responde al momento y sin resultados.
- [ ] Dar y quitar like varias veces seguidas deja el contador coherente.

### IA

- [ ] El chat responde.
- [ ] Escanear un ticket con una foto de cámara desde el móvil. El límite de cuerpo bajó a 8 MB y una
      foto normal tiene que entrar.

---

## Si algo sale mal

| Síntoma | Causa probable |
|---|---|
| 503 en `/api/auth/google` | Falta `GOOGLE_CLIENT_ID` en Render |
| 401 al entrar con Google | `GOOGLE_CLIENT_ID` no vale lo mismo en Render y en Vercel |
| 503 al elegir una foto | Falta `CLOUDINARY_URL` en Render |
| Recetas con 0 comentarios | La migración no se ha aplicado |
| La tarjeta y el detalle no dan el mismo número | Contador desfasado: repite el `--apply`, que los recalcula todos |
| El chat da 503 | `GEMINI_BASE_URL` o `GEMINI_PROXY_TOKEN` no cuadran con el Worker |
| Log `models/gemini-2.5-flash is no longer available` | `GEMINI_MODEL` en Render apunta a un modelo retirado: `gemini-3.6-flash` |
| El log dice `(memoria)` | Las variables de Upstash no llegan al proceso |
| Errores de CORS en la consola | `FRONTEND_URL` no es exactamente la URL de Vercel, sin barra final |

**Volver atrás.** Render → Events permite hacer rollback al deploy anterior, y Vercel → Deployments
promociona el anterior con **Instant Rollback**. Si la migración de comentarios ya se aplicó, el
código viejo no los va a ver: hay que restaurar la copia y borrar la colección nueva, o al volver a
migrar quedan duplicados.

```bash
node "C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f75/restaurar.js"
# y en mongosh: db.comentarios.drop()
```

`restaurar.js` sustituye cada receta de la copia por su versión de entonces, con el array dentro. Las
recetas creadas después de la copia no se borran.

---

## Lo que puede comprobar Claude con Playwright

Con Render en Live y la migración aplicada, Claude puede recorrer contra producción los `curl` del
apartado 3, el feed anónimo, las fotos servidas desde Cloudinary, la búsqueda y los comentarios en el
detalle. Si le pasas una cuenta de correo y contraseña con algún alérgeno, también el filtro de
alérgenos, el chat, la despensa y el ciclo de crear, editar, comentar y borrar una receta de prueba.
Desde la parte 1, al borrar esa receta su foto se borra también de Cloudinary; el avatar, si lo
cambia, sí se queda.

El login con Google real y el ticket desde el móvil siguen necesitando tus manos.

---

# Cuando termines

Di qué casillas han salido bien y cuáles no. Si algo falla, cuenta qué esperabas y qué viste.
