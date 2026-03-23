# Infraestructura Técnica — Cookr (TFG)
> Stack MERN · PWA · Mobile-First · Inteligencia Artificial

---

## 1. Resumen por capas

| Capa | Responsabilidad |
|---|---|
| Next.js + Tailwind | Lo que ve y toca el usuario |
| TanStack + Zustand | Memoria inteligente en el navegador |
| NextAuth + bcrypt | Quién eres y que no te suplanten |
| Express + Zod | Recibe, valida y procesa las peticiones |
| MongoDB + Mongoose | Donde viven los datos para siempre |
| Redis + Upstash | Atajo rápido para datos frecuentes |
| Gemini + Edamam | La inteligencia de la app |
| Vercel + Render | Donde vive todo en la nube |

---

## 2. Frontend — Lo que ve el usuario

Arquitectura Mobile-First construida sobre Next.js + React.

### Estilos y componentes UI

| Librería | Para qué sirve |
|---|---|
| Tailwind CSS | Estilos responsive y utilidades CSS |
| shadcn/ui | Componentes base (modales, drawers, botones) integrados con Tailwind |
| Framer Motion | Animaciones y transiciones fluidas |
| Lucide React | Iconos SVG ligeros y limpios |
| Vaul | Menús que suben desde abajo en móvil (drawer) |
| Embla Carousel | Scroll horizontal de recetas con soporte a swipe |
| Magic UI | Componentes animados (BlurFade, AnimatedList, NumberTicker) sobre Framer Motion y shadcn/ui. Copy-paste, sin dependencia extra |
| Origin UI | Componentes avanzados copy-paste (chat bubbles, file upload, avatar groups, rating stars) con las mismas convenciones de shadcn/ui y Tailwind |
| shadcnblocks | Bloques de UI listos (cards de receta, profile headers, empty states, notification lists) construidos sobre shadcn/ui y Tailwind. Copy-paste sin restricciones |
| Motion Primitives | Primitivos de animación basados en Framer Motion para transiciones entre pasos de receta y entradas de drawers |

### Componentes shadcn/ui instalados

`button` `card` `avatar` `badge` `tabs` `sheet` `dialog` `drawer` `skeleton` `form` `input` `label` `separator`

### Gestión de datos en el cliente

| Librería | Para qué sirve |
|---|---|
| TanStack Query | Caché automática de peticiones al servidor, revalidación en background |
| Zustand | Estado global compartido (usuario logueado, despensa, chat IA) |
| Axios | Llamadas HTTP al backend con interceptors de JWT |

### Custom Hooks — Lógica reutilizable

| Hook | Responsabilidad |
|---|---|
| `useAuth.js` | Login, logout, sesión activa del usuario |
| `useRecetas.js` | Fetch, crear, editar y eliminar recetas |
| `useDespensa.js` | Gestión completa de la despensa virtual |
| `useChatIA.js` | Mensajes, historial y contexto del asistente IA |
| `useGrupos.js` | Buscar, unirse y salir de comunidades |
| `useNotificaciones.js` | Leer y marcar como leídas las notificaciones |
| `useModoManoLibres.js` | Control del modo cocina con TTS y wake lock |

### PWA y Accesibilidad

| Feature | Descripción |
|---|---|
| Service Worker (next-pwa) | Caché de recetas visitadas para uso sin conexión wifi |
| Web App Manifest | App instalable en móvil, icono en pantalla de inicio, modo standalone |
| Web Speech API (TTS) | Lee los pasos de la receta en voz alta (Modo Manos Libres) |
| Navigator Wake Lock | Evita que la pantalla se apague mientras el usuario cocina |

---

## 3. Capa de comunicación

Todo el tráfico entre frontend y backend pasa por estos filtros en orden:

```
Petición HTTPS del cliente
  ↓
CORS — solo acepta orígenes autorizados
  ↓
Rate Limiter — evita abuso de la API (especialmente rutas de IA)
  ↓
JWT Middleware — verifica token en cada petición protegida
  ↓
Zod — valida los datos del request antes de tocar nada
  ↓
Controlador de Express
```

---

## 4. Backend — Lógica de negocio

Node.js + Express.js con arquitectura por capas clara y separada.

### Flujo interno

```
Rutas: /api/recetas  /api/usuarios  /api/grupos  /api/despensa  /api/chat
  ↓
Middlewares (auth, validación, manejo de errores)
  ↓
Controladores (lógica de negocio)
  ↓
Modelos Mongoose (esquemas del dominio)
  ↓
MongoDB Atlas
```

### Autenticación

| Tecnología | Función |
|---|---|
| NextAuth.js | Gestiona el flujo completo: Google OAuth + email/contraseña |
| bcrypt | Hashea contraseñas antes de guardar, nunca en texto plano |
| JWT | Tokens de acceso y refresco, verificados en cada petición |
| Google OAuth 2.0 | Login con cuenta de Google sin necesidad de contraseña |

### Validación por capas

| Dónde | Qué hace |
|---|---|
| Zod (Frontend) | Errores instantáneos en el formulario antes de enviar |
| Zod (Backend) | Segunda barrera, protege la API de peticiones directas |
| Mongoose | Validación final antes de escribir en MongoDB |

---

## 5. Base de datos

### MongoDB Atlas — Base de datos principal

- **Tipo:** NoSQL orientada a documentos
- **Por qué:** Esquema flexible, ideal para recetas con longitud variable de ingredientes y pasos
- **ODM:** Mongoose para definir esquemas, validaciones y relaciones
- **Hosting:** MongoDB Atlas (cloud, tier gratuito suficiente para TFG)

### Redis (Upstash) — Caché del servidor

Redis actúa como intermediario entre Express y MongoDB para reducir consultas repetidas.

| Qué se cachea | Configuración |
|---|---|
| Feed de recetas populares | Expira cada 5 minutos |
| Recetas trending de un grupo | Misma lógica para todos los miembros |
| Info nutricional de recetas | Nunca cambia, caché permanente |
| Sesiones de usuario (JWT) | Acceso en 2ms en cada petición |
| Despensa del usuario | NO — es única por usuario |
| Mensajes del chat IA | NO — son privados y dinámicos |

**Impacto del caché:**
- Sin Redis: 500 usuarios → 500 consultas a MongoDB → 200ms c/u
- Con Redis: 500 usuarios → 1 consulta a MongoDB + 499 desde Redis → 2ms c/u

---

## 6. Servicios externos

| Servicio | Para qué se usa |
|---|---|
| Google Gemini API | Asistente culinario con contexto de la despensa virtual del usuario |
| Edamam API | Cálculo nutricional automático al crear o editar una receta |
| Cloudinary | Almacenamiento y CDN de imágenes y vídeos de recetas |
| Resend | Emails de verificación de cuenta y notificaciones transaccionales |
| Google OAuth | Login con cuenta de Google gestionado a través de NextAuth.js |
| Upstash | Redis cloud con tier gratuito, conexión idéntica a Redis local |

---

## 7. Despliegue e infraestructura cloud

| Componente | Plataforma y motivo |
|---|---|
| Frontend Next.js | Vercel — deploy automático, CDN global, optimizado para Next.js |
| Backend Node.js | Render o Railway — más económico que AWS para un TFG |
| Base de datos | MongoDB Atlas — cloud, backups automáticos, tier gratuito M0 |
| Redis | Upstash — serverless Redis, tier gratuito, sin servidor que mantener |
| CI/CD | GitHub Actions — deploy automático al hacer push a la rama main |

---

## 8. Flujo completo de una petición típica

Ejemplo: usuario busca "pasta vegana" en el feed de inicio.

```
Usuario escribe "pasta vegana" en el buscador
  ↓
Zustand aporta sus alergias como filtro automático (sin que el usuario lo indique)
  ↓
TanStack Query → ¿tengo esta búsqueda en caché del navegador?
  SÍ → muestra al instante (0ms)
  NO → petición al servidor
  ↓
JWT Middleware verifica token → busca sesión en Redis (2ms)
  ↓
Zod valida los parámetros de búsqueda recibidos
  ↓
Controlador busca en Redis → ¿hay caché del feed?
  HIT → devuelve en 2ms sin tocar MongoDB
  MISS → consulta MongoDB → guarda en Redis → devuelve
  ↓
TanStack Query guarda resultado en caché del navegador
  ↓
Componente se actualiza con animación de Framer Motion ✅
```

---

## 9. Paleta de colores — Cookr

Definida en: `src/app/globals.css` · Formato: `oklch` con CSS variables + Tailwind

### Variables de marca

| Variable | Uso |
|---|---|
| `--brand` | Color principal Cookr (ocre/naranja cálido) |
| `--brand-muted` | Versión suave del brand |
| `--brand-subtle` | Versión muy sutil, para fondos de badges |
| `--warm-bg` | Fondo cálido para secciones hero |
| `--warm-bg-accent` | Variante más intensa del fondo cálido |
| `--auth-dark` | Negro cálido para el panel de autenticación |
| `--category-social` | Azul para elementos de comunidad/social |
| `--category-ai` | Violeta para elementos de IA |
| `--theme-fresh` | Verde para carrusel de ensaladas |
| `--theme-sweet` | Rosa para carrusel de postres |
| `--theme-pasta` | Violeta para carrusel de pastas |

### Regla para futuros desarrollos

```
✅ CORRECTO:   bg-brand text-primary-foreground border-border
❌ INCORRECTO: bg-orange-500 text-white border-gray-200

NUNCA usar colores hardcodeados (hex, rgb, clases Tailwind genéricas)
SIEMPRE usar las variables CSS de globals.css a través de Tailwind
```

### Excepciones permitidas

- `bg-black/30` — overlay semitransparente funcional
- Google SVG fills en `botonGoogle.tsx` — colores corporativos obligatorios
