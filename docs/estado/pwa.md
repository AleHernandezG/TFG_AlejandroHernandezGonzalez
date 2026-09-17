# Cookr como aplicación instalable (PWA)

Qué hay que hacer para que Cookr se instale como aplicación de escritorio en Windows, macOS y Linux, y
como aplicación en Android e iOS, sin tocar una sola línea de lógica de negocio.

Para una aplicación de recetas esto no es un adorno. Se cocina con el móvil apoyado en la encimera, a
veces en una cocina donde la wifi no llega, y con las manos sucias. Una aplicación que abre en un
segundo desde el escritorio, sin barra de direcciones, y que enseña la receta guardada aunque no haya
red, es otra cosa distinta de una pestaña del navegador.

---

## Situación de partida

| Pieza | Estado |
|---|---|
| `next-pwa@5.6.0` | **Declarada en `package.json` y nunca importada.** `next.config.mjs` no la usa |
| Manifiesto | No existe |
| Service worker | No existe |
| Iconos | Solo `src/app/icon.svg` (100×100, cuadrado redondeado `#9a5a2d` con un gorro de cocinero `#fdf7f0`) |
| `public/` | Solo `alergenos/` e `images/` |
| Metadatos | `app/layout.tsx` exporta `title` y `description`. Sin `themeColor`, sin `viewport`, sin `appleWebApp` |

Lo primero es quitar `next-pwa` del `package.json`. La versión 5.6.0 es de 2022, no tiene soporte
oficial de App Router y arrastra un Workbox antiguo. El sucesor del mismo autor es **Serwist**
(`@serwist/next`), que sí está pensado para App Router y para Next 14. Ese es el que hay que instalar.

---

## Lo que hace falta, por orden

### 1. El manifiesto

Next 14 lo genera desde `src/app/manifest.ts`, con tipos:

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cookr · Red social gastronómica',
    short_name: 'Cookr',
    description: 'Descubre, guarda y cocina recetas con ayuda de IA',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fdfaf6',
    theme_color: '#fdfaf6',
    lang: 'es',
    dir: 'ltr',
    categories: ['food', 'lifestyle', 'social'],
    icons: [...],
  }
}
```

`background_color` es lo que se ve en la pantalla de arranque antes de que React monte, así que tiene
que ser el mismo blanco cálido del tema claro (`--background`, que es `oklch(0.985 0.003 75)`, en
hexadecimal `#fdfaf6`). Si se pone blanco puro se nota el parpadeo.

`display: 'standalone'` y no `fullscreen`: hace falta la barra de estado del sistema para ver la hora
mientras se cocina.

### 2. Los iconos

De los cuatro que hacen falta solo hay uno, y hay un detalle que se pasa por alto siempre:

| Fichero | Tamaño | Para qué |
|---|---|---|
| `src/app/icon.svg` | vectorial | Favicon. **Ya existe** |
| `public/icons/icon-192.png` | 192×192 | Mínimo que exige el manifiesto |
| `public/icons/icon-512.png` | 512×512 | Escritorio, tiendas, pantalla de arranque |
| `public/icons/icon-512-maskable.png` | 512×512 | Icono adaptativo de Android |
| `src/app/apple-icon.png` | 180×180 | iOS, sin transparencia, y iOS le pone él las esquinas |

El detalle: **el icono enmascarable no puede ser el mismo PNG**. Android recorta el icono con la forma
que decida el lanzador (círculo, redondeado, gota), y solo garantiza que se vea el 80 % central. El
icono actual tiene el fondo con `rx="22"`, o sea esquinas ya redondeadas, y el gorro ocupa casi todo el
cuadro. Si se usa tal cual como enmascarable, en un lanzador circular se ven las esquinas del cuadrado
recortadas por dentro y el gorro con el ala comida. La versión enmascarable necesita el fondo
`#9a5a2d` a sangre, sin `rx`, y el gorro al 60 % del ancho, centrado.

Los PNG se sacan del SVG con `sharp` o `resvg` en un script de `scripts/`, no a mano.

### 3. El color de la barra del sistema, en los dos temas

Cookr tiene tema claro y oscuro. El manifiesto solo admite un `theme_color`, así que el que cambia con
el tema va como metadato, y Next 14 lo expone en el `export const viewport`:

```ts
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfaf6' },
    { media: '(prefers-color-scheme: dark)', color: '#171310' },
  ],
  viewportFit: 'cover',
}
```

`viewportFit: 'cover'` importa: el código ya usa `env(safe-area-inset-bottom)` en la barra inferior y
en el FAB, y sin esto los `env()` valen cero en modo instalado.

En el mismo `layout.tsx` hay que añadir `appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Cookr' }`,
que es lo que evita que iOS abra la aplicación instalada dentro de un Safari con barra de direcciones.

### 4. El service worker

Con Serwist, el worker vive en `src/app/sw.ts` y se compila al instalar. La estrategia por tipo de
recurso es lo único que hay que pensar de verdad:

| Qué | Estrategia | Por qué |
|---|---|---|
| Documentos HTML de navegación | `NetworkFirst`, 3 s de espera, con una página `/offline` de reserva | El contenido cambia, pero si no hay red algo hay que enseñar |
| JS, CSS y fuentes de `/_next/static` | `CacheFirst` | Llevan hash en el nombre, no caducan nunca |
| Imágenes de `res.cloudinary.com` y `images.pexels.com` | `CacheFirst`, tope de 200 entradas, 30 días | Son lo que más pesa y lo que menos cambia |
| `GET /api/recetas`, `/api/recetas/:id` | `StaleWhileRevalidate`, 24 h | Enseña la receta al momento y la refresca por detrás |
| `GET /api/usuarios/me`, `/api/despensa` | `NetworkFirst` | Datos propios, no vale enseñarlos viejos sin avisar |
| **`/api/auth/*`, `/api/chat/*` y todo lo que no sea `GET`** | `NetworkOnly` | Nunca |

Esa última fila es la que hay que respetar por encima de todo. Cookr tiene dos sesiones (la cookie de
NextAuth y el JWT del backend dentro de ella), y un service worker que cachee una respuesta
autenticada puede servírsela a otra persona en el mismo dispositivo. La regla es simple: **si la
petición lleva `Authorization` o `Cookie`, no se cachea la respuesta sin pensarlo dos veces**, y las
rutas de sesión no se cachean nunca. Tampoco se precachea ninguna página del grupo `(main)`, porque
todas llevan datos de usuario.

El precacheado se limita al esqueleto: el JS y el CSS de la aplicación, las fuentes Geist, los iconos,
los SVG de `public/alergenos/` y una página `/offline` estática.

### 5. Modo sin conexión que sirva para algo

Un `/offline` que diga «no hay conexión» es lo mínimo y no es interesante. Lo que tiene sentido en
Cookr es que **la colección guardada funcione sin red**. El usuario guarda seis recetas el domingo y el
martes las abre en una cocina sin cobertura.

Se consigue sin infraestructura nueva: TanStack Query ya tiene el estado de servidor, y con
`@tanstack/query-persist-client-core` sobre IndexedDB la caché de consultas sobrevive al cierre de la
aplicación. Al abrir `/coleccion` sin red, la lista sale de ahí; cada receta guardada que se haya
abierto alguna vez sale de la caché de `/api/recetas/:id`. Las que no se hayan abierto nunca no
estarán, y hay que decirlo en la interfaz en vez de enseñar un error.

Lo honesto es marcar el estado: una franja discreta arriba, «Sin conexión · viendo contenido
guardado», y deshabilitar lo que no puede funcionar (publicar, comentar, el chat con IA). Una
aplicación que finge que todo va bien y luego falla al pulsar es peor que una que lo dice.

Crear recetas sin conexión con sincronización diferida queda fuera. Sube una imagen a Cloudinary y
llama a Gemini; no merece la pena.

### 6. El botón de instalar

Los navegadores de escritorio y Android disparan `beforeinstallprompt`. Hay que capturarlo, guardar el
evento y enseñar un botón propio en un sitio con sentido (el menú de perfil), en vez de dejar que el
usuario descubra el iconito de la barra de direcciones.

```
perfil ▸ ⬇ Instalar Cookr
```

Reglas para no ser pesado: se enseña a partir de la segunda sesión, se esconde si
`window.matchMedia('(display-mode: standalone)').matches` (ya está instalada), y si se descarta no se
vuelve a ofrecer hasta dentro de un mes (una marca en `localStorage`).

**iOS es el caso raro y hay que tratarlo aparte.** Safari no dispara `beforeinstallprompt` y no hay
forma de pedir la instalación por código: solo el usuario, desde Compartir → Añadir a pantalla de
inicio. Lo único que se puede hacer es detectar Safari en iOS sin `standalone` y enseñar una hoja
explicándolo con el icono de compartir dibujado. Sin eso, en iPhone nadie instala nada.

### 7. Extras del manifiesto que sí aportan

Accesos directos, que salen al pulsar largo en el icono (Android) o clic derecho en la barra de tareas
(Windows):

```ts
shortcuts: [
  { name: 'Crear receta', url: '/crear-receta', icons: [...] },
  { name: 'Mi colección',  url: '/coleccion' },
  { name: 'Cookr IA',      url: '/chat' },
]
```

Capturas, que es lo que hace que el diálogo de instalación de Chrome pase de una línea gris a una
tarjeta con imágenes:

```ts
screenshots: [
  { src: '/capturas/movil-feed.png',  sizes: '390x844',   type: 'image/png', form_factor: 'narrow' },
  { src: '/capturas/pc-discover.png', sizes: '1440x900',  type: 'image/png', form_factor: 'wide' },
]
```

Y uno que encaja demasiado bien con lo que ya hace Cookr: **`share_target`**. Declarando

```ts
share_target: {
  action: '/crear-receta',
  method: 'GET',
  params: { title: 'titulo', text: 'texto', url: 'enlace' },
}
```

Cookr aparece en el menú de compartir de Android. El usuario ve una receta en cualquier sitio, pulsa
compartir, elige Cookr, y llega a `/crear-receta` con el texto en la query. Ahí ya existe «Crear desde
descripción (IA)», que come exactamente eso. Es el camino más corto entre «he visto una receta» y «la
tengo en mi cuenta», y cuesta un parámetro de query. Solo funciona en Android, y no pasa nada.

---

## Qué puede salir mal

**Un service worker viejo sirviendo una versión antigua.** Es el fallo clásico y el más difícil de
diagnosticar, porque el usuario jura que el error sigue ahí después de arreglarlo. Se evita con
`skipWaiting` más un aviso en la interfaz: cuando el worker nuevo pasa a `waiting`, sale un aviso
«Hay una versión nueva · Actualizar» que recarga. Nunca recargar sola, que se pierde lo escrito en un
formulario.

**La caché de imágenes creciendo sin freno.** Cloudinary sirve fotos de recetas y el feed es infinito.
Sin `maxEntries` y `maxAgeSeconds`, en un mes la aplicación ocupa cientos de megas y Android la
desaloja entera, caché de sesión incluida.

**Desarrollo.** El worker se desactiva con `disable: process.env.NODE_ENV === 'development'`. Con él
activo en `npm run dev`, el *hot reload* se pelea con la caché y se pierde media mañana.

**Vercel.** El worker se sirve desde la raíz del dominio, así que el `scope` es `/` y no hay problema.
Lo que sí hay que revisar es que la cabecera de `sw.js` no sea cacheable: `Cache-Control: no-cache`,
o el navegador se queda con un worker viejo durante horas.

**Comprobación.** Lighthouse ya no tiene categoría PWA, así que la verificación va por DevTools →
Application → Manifest (avisa de los iconos que faltan y del enmascarable mal recortado) y
Application → Service Workers. Para el resto, [PWABuilder](https://www.pwabuilder.com/) analiza una URL
en producción y lista lo que falta.

---

## Trabajo estimado

| Bloque | Tiempo |
|---|---|
| Quitar `next-pwa`, instalar `@serwist/next`, configurar | 2 h |
| Manifiesto, iconos (script de generación incluido), metadatos y `viewport` | 3 h |
| Service worker con las estrategias de la tabla | 4 h |
| Página `/offline` y aviso de sin conexión | 2 h |
| Persistencia de TanStack Query en IndexedDB para la colección | 4 h |
| Botón de instalar más la hoja de iOS | 3 h |
| Accesos directos, capturas y `share_target` | 2 h |
| Pruebas en Windows, Android y iOS reales | 3 h |

Unas tres jornadas. Los cuatro primeros bloques ya dan una aplicación instalable de verdad; el resto se
puede dejar caer después sin bloquear nada.

Orden recomendado: manifiesto e iconos primero (con eso Chrome ya ofrece instalar en escritorio y se
ve el resultado el mismo día), luego el worker, luego el modo sin conexión de la colección, y al final
el botón y los extras.

---

## Referencias

- [Make PWAs installable — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).
  Los requisitos exactos de instalabilidad, que es lo que conviene leer antes de escribir el manifiesto.
- [Web app manifests — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest).
  Referencia campo a campo, incluidos `shortcuts`, `screenshots` y `share_target`.
- [Maskable icons — web.dev](https://web.dev/articles/maskable-icon). La zona segura del 80 % y por qué
  el icono actual no sirve tal cual.
- [Serwist](https://serwist.pages.dev/docs/next/getting-started). El sustituto de `next-pwa` para App
  Router, del mismo autor.
- [Next.js: manifest.json](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)
  y [viewport](https://nextjs.org/docs/app/api-reference/functions/generate-viewport). Las convenciones
  de fichero de Next 14 para las dos piezas de metadatos.
- [Add to Home Screen en iOS — WebKit](https://webkit.org/blog/14205/news-from-wwdc23-web-push-on-ios-and-ipados/).
  Lo que Safari sí hace y lo que no, incluido que desde iOS 16.4 una aplicación instalada puede recibir
  notificaciones push.
- [Workbox: estrategias de caché](https://developer.chrome.com/docs/workbox/caching-strategies-overview).
  De dónde salen `NetworkFirst`, `CacheFirst` y `StaleWhileRevalidate` de la tabla.
- [TanStack Query: persistencia](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient).
  Para la colección sin conexión.
