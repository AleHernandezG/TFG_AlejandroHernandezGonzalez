# Proxy de Gemini (Cloudflare Worker)

El nivel gratuito de la API de Gemini bloquea las IPs de datacenter, así que las llamadas
desde Render devuelven un `403 Forbidden` de Google aunque la clave sea válida (desde una IP
residencial funciona sin problema). Este Worker resuelve eso: reenvía las peticiones a Google
desde una IP de Cloudflare con buena reputación.

Flujo:

```
Backend (Render) ──► Cloudflare Worker ──► generativelanguage.googleapis.com
```

El backend solo cambia a qué URL apunta el SDK (`GEMINI_BASE_URL`). El Worker no toca el cuerpo
de la petición: la reenvía tal cual, incluida la cabecera `x-goog-api-key` con tu clave.

## Seguridad

El Worker exige una cabecera `x-proxy-token` que debe coincidir con el secreto `PROXY_TOKEN`.
Sin eso sería un proxy abierto y cualquiera podría gastar tu cuota de Cloudflare. El backend
manda ese token automáticamente cuando defines `GEMINI_PROXY_TOKEN`.

Falla cerrado a propósito: **si `PROXY_TOKEN` no está definido, el Worker responde 500 a todo**.
Un despliegue sin los secretos puestos se queda inservible, que es mejor que quedarse abierto.
Sin la cabecera, o con una que no coincida, responde 403.

Solo reenvía las rutas que empiezan por `/v1beta/models/`, que es lo único que usa el backend.
Cualquier otra responde 404 sin salir a Google, para que el Worker no sirva de relé anónimo
hacia el resto de la API.

Genera un token cualquiera, por ejemplo:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

## Desplegar

### Opción A — Panel de Cloudflare (sin instalar nada)

1. Crea una cuenta gratis en cloudflare.com.
2. **Workers & Pages → Create → Create Worker**. Ponle nombre `gemini-proxy` y **Deploy**.
3. **Edit code**, borra el ejemplo y pega el contenido de [worker.js](worker.js). Guarda y **Deploy**.
4. **Settings → Variables and Secrets → Add**: crea `PROXY_TOKEN` como *Secret* con el token que generaste.
5. Copia la URL del Worker (algo como `https://gemini-proxy.tu-subdominio.workers.dev`).

### Opción B — Wrangler (CLI)

```bash
npm install -g wrangler
wrangler login
cd gemini-proxy
wrangler deploy
wrangler secret put PROXY_TOKEN   # pega el token cuando lo pida
```

## Conectar el backend (Render)

En Render, en las variables de entorno del servicio, añade:

| Variable | Valor |
|---|---|
| `GEMINI_BASE_URL` | la URL del Worker, sin barra final (`https://gemini-proxy.tu-subdominio.workers.dev`) |
| `GEMINI_PROXY_TOKEN` | el mismo token que pusiste en `PROXY_TOKEN` del Worker |

Guarda y redespliega. En local no definas `GEMINI_BASE_URL`: las llamadas siguen yendo directas,
que desde tu equipo funcionan.

## Comprobar que va

```bash
curl -s "https://TU-WORKER.workers.dev/v1beta/models?key=TU_API_KEY" \
  -H "x-proxy-token: TU_TOKEN" | head -c 300
```

Si devuelve el JSON con la lista de modelos, el proxy funciona. Un `403 Forbidden: invalid
proxy token` significa que el token no coincide.
