# Revisión del despliegue · F6 y F7

Checklist para llevar a producción los bloques F6 (seguridad) y F7 (rendimiento) mergeando `develop`
en `main`, y para comprobar después que funcionan. Escrita el 16/09/2026. Sustituye a la de julio,
que se desplegó el 17/07/2026.

Aquí el orden no es decorativo: hay variables que tienen que estar en Render **antes** del deploy y
una migración que va **justo después**. Marca cada casilla cuando la compruebes.

| Qué | URL |
|---|---|
| Frontend | https://tfg-alejandro-hernandez-gonzalez.vercel.app |
| Backend | https://tfg-alejandrohernandezgonzalez.onrender.com/api |
| Worker de Gemini | https://gemini-proxy.alejes.workers.dev |

`cookr.vercel.app` no es Cookr, es otra aplicación que se llama igual. No pruebes nada ahí.

---

## Qué entra y cómo está producción hoy

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
mongodump --uri="<MONGODB_URI de producción>" --collection=recetas --out="C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f75"
```

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
mongorestore --uri="<MONGODB_URI>" --drop --nsInclude="cookr.recetas" "C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f75"
# y en mongosh: db.comentarios.drop()
```

---

## Lo que puede comprobar Claude con Playwright

Con Render en Live y la migración aplicada, Claude puede recorrer contra producción los `curl` del
apartado 3, el feed anónimo, las fotos servidas desde Cloudinary, la búsqueda y los comentarios en el
detalle. Si le pasas una cuenta de correo y contraseña con algún alérgeno, también el filtro de
alérgenos, el chat, la despensa y el ciclo de crear, editar, comentar y borrar una receta de prueba.
La foto de esa receta se queda en Cloudinary, porque nada borra allí, y hay que quitarla a mano.

El login con Google real y el ticket desde el móvil siguen necesitando tus manos.

## Cuando termines

Di qué casillas han salido bien y cuáles no. Si algo falla, cuenta qué esperabas y qué viste.
