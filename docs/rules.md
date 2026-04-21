# Rules — Cookr TFG

> Archivo de referencia rápida. Adjuntar al inicio de cada sesión de desarrollo.
> Fuente canónica: `docs/context.md`, `docs/folderStructure.md`, `docs/tech-debt.md`.

---

## 1. Arquitectura de capas — obligatorio en todo momento

### Frontend

```
Componente → Hook → Service → apiClient → Backend
```

| Capa | Responsabilidad | Archivo tipo |
|---|---|---|
| Componente | Solo renderizado y UI. Llama al hook. | `features/<f>/components/*.tsx` |
| Hook | Gestiona estado local + llama al service. | `features/<f>/hooks/use*.ts` |
| Service | Métodos HTTP nombrados por dominio. | `src/services/*Service.ts` |
| apiClient | Instancia Axios centralizada con JWT. | `src/services/apiClient.ts` |

**NUNCA:**
- Un componente llama a Axios directamente
- Un hook conoce rutas de la API (`/api/recetas`)
- Lógica de negocio dentro de un componente

**SIEMPRE:**
- Nuevas llamadas HTTP → `src/services/<nombre>Service.ts`
- Nuevo estado global → `src/stores/<nombre>Store.ts`
- Imports de features → siempre por el barrel raíz (`@/features/<f>/components`)

### Backend

```
Route → Controller → Service → Repository → MongoDB
```

| Capa | Responsabilidad |
|---|---|
| Route | Define endpoints y aplica middlewares. Sin lógica de negocio. |
| Controller | Recibe request validado, llama al service, devuelve response. |
| Service | Toda la lógica de negocio. No accede a MongoDB directamente. |
| Repository | Toda la comunicación con MongoDB/Redis. |
| Model | Solo define el esquema Mongoose. Sin lógica. |

**NUNCA:**
- Un controller accede a modelos Mongoose directamente
- Lógica de negocio en routes o controllers
- Acceso a MongoDB fuera del repository

**SIEMPRE:**
- Nuevo acceso a BD → `backend/src/repositories/<nombre>Repository.ts`

---

## 2. Regla de cambio sin efecto cascada

Si en el futuro hay que cambiar una tecnología, **solo se toca un fichero**:

| Quiero cambiar… | Solo toco… |
|---|---|
| URL del backend | `src/services/apiClient.ts` |
| Axios por fetch | `src/services/apiClient.ts` |
| MongoDB por PostgreSQL | `backend/src/repositories/*.ts` |
| shadcn por otra UI lib | `src/components/ui/` |
| Zustand por Jotai | `src/stores/*.ts` |
| TanStack Query por SWR | `src/features/*/hooks/*.ts` |
| Gemini por otro modelo IA | `backend/src/services/chatService.ts` |
| Cloudinary por S3 | `backend/src/services/imagenService.ts` |

---

## 3. Paleta de colores — 0 colores hardcodeados

**Fuente canónica:** `frontend/src/app/globals.css`

### Regla absoluta

```
✅ CORRECTO:   bg-brand text-primary-foreground border-border
✅ CORRECTO:   bg-[var(--auth-dark)] text-[var(--category-social)]
❌ INCORRECTO: bg-orange-500 text-white border-gray-200
❌ INCORRECTO: color: #f97316
```

Si el color que necesitas no existe como variable, **crear una nueva variable en `globals.css`** (`:root` y `.dark`) antes de usarla.

### Variables disponibles

**Marca Cookr:**
```
--brand              color principal (ocre/naranja cálido)
--brand-foreground   texto sobre fondo brand
--brand-muted        versión suave del brand
--brand-subtle       versión muy sutil, para fondos de badges
```

**Fondo y UI base (shadcn):**
```
--background / --foreground
--card / --card-foreground
--popover / --popover-foreground
--primary / --primary-foreground
--secondary / --secondary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--destructive
--border / --input / --ring
```

**Fondos cálidos:**
```
--warm-bg            fondo cálido suave
--warm-bg-accent     variante más intensa
```

**Hero gradient (carrusel landing):**
```
--hero-gradient-start / --hero-gradient-mid / --hero-gradient-end
```

**Categorías semánticas:**
```
--category-social    azul — elementos de comunidad/social
--category-ai        violeta — elementos de IA
```

**Temas del carrusel:**
```
--theme-fresh        verde — ensaladas
--theme-sweet        rosa — postres
--theme-pasta        violeta — pastas
```

**Panel auth:**
```
--auth-dark          negro cálido — fondo del panel de autenticación
```

**Charts (uso secundario):**
```
--chart-1 a --chart-5
```

### Excepciones permitidas (documentadas)

```
bg-black/30–/60        → overlays semitransparentes funcionales sobre fotografía
                          (hero carousel, registro, login). Necesarios para legibilidad
                          del texto. No son colores de marca, son capas de oscurecimiento.

text-white             → texto sobre overlay oscuro forzado (hero, auth).
                          NO sustituible por text-foreground: en light mode foreground
                          es oscuro y el texto quedaría ilegible sobre el overlay negro.

border-white/N         → bordes de componentes UI dentro de un contexto
bg-white/N             → de overlay oscuro sobre fotografía (ej. botón outline del hero).
hover:bg-white/N       → Mismo razonamiento que text-white.

rgba(0,0,0,N) en       → CSS filter (drop-shadow) y text-shadow no aceptan CSS
filter / textShadow     → custom properties con modificador de opacidad en Tailwind v3.
inline style            → Excepción técnica — no hay alternativa con variables.

rgba(var(--brand),N)   → ✅ CORRECTO — usa la variable del sistema.

Google SVG fills        → colores corporativos obligatorios de Google en botonGoogle.tsx
```

---

## 4. Nomenclatura de archivos y componentes

| Ámbito | Convención | Ejemplo |
|---|---|---|
| Componentes FE | `camelCase` español | `tarjetaPost.tsx`, `formularioRegistro.tsx` |
| Hooks FE | `use` + camelCase español | `useAuth.ts`, `useRecetas.ts` |
| Stores Zustand | `use` + nombre + `Store` | `useAuthStore.ts` |
| Services FE | nombre + `Service` | `authService.ts`, `recetasService.ts` |
| Types FE | nombre + `.types` | `receta.types.ts`, `autenticacion.ts` |
| Datos mock | `datos` + nombre | `datosFeed.ts`, `datosDetalle.ts` |
| Models BE | nombre + `Mongo` | `usuarioMongo.ts`, `tokenMongo.ts` |
| Types BE | nombre (sin sufijo) | `usuario.ts`, `token.ts` |
| Controllers BE | nombre + `Controller` | `authController.ts` |
| Repositories BE | nombre + `Repository` | `usuarioRepository.ts` |
| Routes BE | nombre + `.routes` | `auth.routes.ts` |

---

## 5. Estructura de carpetas — frontend

```
src/
├── app/                   # Rutas Next.js App Router (solo routing y layouts)
├── components/
│   ├── ui/                # shadcn/ui — NO añadir componentes propios aquí
│   └── common/            # Componentes reutilizables globales (PiePagina, NavBar...)
├── features/              # Patrón feature-based — un módulo por dominio
│   └── <feature>/
│       ├── components/    # Componentes del feature + index.ts (barrel)
│       │   ├── <vista>/   # Subcarpetas si hay vistas diferenciadas
│       │   └── index.ts
│       ├── hooks/         # Hooks específicos del feature
│       ├── data/          # Datos mock y constantes
│       └── types/         # Tipos TypeScript del feature
├── hooks/                 # Hooks globales (usados por 2+ features)
├── stores/                # Zustand stores globales
├── services/              # apiClient.ts + *Service.ts
├── types/                 # Tipos TypeScript compartidos entre features
├── config/                # Constantes y variables de entorno tipadas
└── lib/
    ├── utils.ts           # Requerido por shadcn/ui — NO mover
    └── auth.ts            # opcionesAuth NextAuth — NO mover
```

**Barrel exports — regla obligatoria:**
- Cada `components/` tiene `index.ts` que re-exporta todo
- Los imports externos **siempre** van por el barrel raíz:
  ```ts
  // ✅ CORRECTO
  import { TarjetaPost } from "@/features/recetas/components"
  // ❌ INCORRECTO
  import { TarjetaPost } from "@/features/recetas/components/home/tarjetaPost"
  ```

---

## 6. Estructura de carpetas — backend

```
backend/src/
├── controllers/           # Reciben request, devuelven response
├── models/                # Schemas Mongoose — importa interfaces de types/
├── repositories/          # Toda la comunicación con MongoDB
├── routes/                # Definición de endpoints y middlewares
├── middlewares/           # Validación, autenticación, errores
├── services/              # Lógica de negocio
├── types/                 # Interfaces de dominio puras (sin acoplamiento a Mongoose)
└── lib/                   # db.ts, jwt.ts, validadores.ts
```

**Patrón de separación modelo/tipo:**
- `types/<nombre>.ts` — interfaz de dominio pura, sin `Document` ni schemas
- `models/<nombre>Mongo.ts` — `IXxxDoc extends IXxx, Document` + schema Mongoose
- `repositories/<nombre>Repository.ts` — importa `IXxx` de `types/` e `IXxxDoc` + modelo de `models/`

Beneficio: si el schema cambia (nuevo campo, índice, opción Mongoose), `types/` no se toca. Si cambia la BD, solo cambian `models/` y `repositories/`.

---

## 7. Formularios — React Hook Form + Zod

- Toda validación de formulario usa **Zod** como schema fuente de verdad
- Los formularios usan **React Hook Form** con `zodResolver`
- Siempre incluir `defaultValues` en `useForm` (evita el bug de Zod con `undefined`)
- Los mensajes de error son personalizados en el schema Zod (no los genéricos)

```ts
// ✅ CORRECTO
const form = useForm<TDatos>({
  resolver: zodResolver(esquema),
  defaultValues: { campo: "" }
})

// ❌ INCORRECTO — Zod recibe undefined y usa mensajes genéricos
const form = useForm<TDatos>({ resolver: zodResolver(esquema) })
```

---

## 8. Animaciones — Framer Motion v12

- Anotar las variantes con el tipo `Variants` (v12 es estricto con `ease: string`)
- Usar `layoutId` para transiciones entre elementos relacionados (ej: NavBar pill)
- Los stagger effects usan `staggerChildren` en el contenedor padre

```ts
// ✅ CORRECTO
import { type Variants } from "framer-motion"
const variantes: Variants = { oculto: { opacity: 0 }, visible: { opacity: 1 } }
```

---

## 9. Reglas de diseño UI

### Mobile-first obligatorio

- Diseñar para móvil primero, luego `md:` y `lg:`
- La NavBar inferior usa `lg:hidden` — nunca mostrar en escritorio
- Layout PC completo se activa en `lg:` con sidebars

### No-Line Rule

- Las separaciones visuales se hacen con **color de fondo distinto**, no con bordes `border-1`
- Usar `border-border` solo cuando sea estrictamente necesario (ej: inputs)

### Sombras ambient en tarjetas

```
shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]
```

### Glassmorphism en headers PC

```
bg-background/80 backdrop-blur-md
```

### Tiempos relativos — hydration

Cualquier elemento que muestre tiempo relativo calculado con `Date.now()` en render **DEBE** llevar `suppressHydrationWarning`:

```tsx
<span suppressHydrationWarning>{tiempoRelativo(fecha)}</span>
```

---

## 10. Flujo Stitch — referencia visual obligatoria antes de implementar

Antes de implementar cualquier vista FE nueva:
1. Crear diseño en Stitch by Google (`stitch.withgoogle.com`)
2. Guardar en `docs/stitch/<nombreVista>/`: `<nombre>.png` + `<nombre>.html`
3. Adjuntar ambos al iniciar la implementación

Stitch se usa **SOLO** como referencia de layout, jerarquía y composición.

**NUNCA usar de Stitch:**
- Código HTML directamente
- Colores (usar paleta Cookr de `globals.css`)
- Componentes (usar shadcn/ui + librerías del proyecto)
- Fuentes (usar Geist configurada en el proyecto)
- Clases CSS (usar variables Cookr + Tailwind)

| Vista | Carpeta |
|---|---|
| Home / Feed | `home/` |
| Detalle de receta | `detalleReceta/` |
| Crear receta | `crearReceta/` |
| Perfil | `perfil/` |
| Despensa | `despensa/` |
| Chat IA | `chat/` |
| Grupos | `grupos/` |
| Notificaciones | `notificaciones/` |
| Ajustes | `ajustes/` |

### Prompt sugerido para Stitch

```
App de red social gastronómica llamada Cookr. Diseño mobile-first (375px de ancho),
estilo moderno y limpio. Paleta cálida con tonos ocre y naranja suave, fondos crema.
App instalable en móvil (PWA). Barra de navegación inferior con 5 iconos.
La vista que necesito es: [descripción detallada de la vista].
```

### Cómo traduce Claude Code el diseño de Stitch

| Stitch muestra | Claude Code implementa |
|---|---|
| Card con fondo blanco y borde gris | `<Card className="bg-card border-border">` |
| Botón naranja primario | `<Button className="bg-brand text-brand-foreground">` |
| Input con label | shadcn `<FormField>` + `<Input>` + `<Label>` |
| Texto gris secundario | `<p className="text-muted-foreground">` |
| Fondo de página | `<div className="bg-background">` |
| Icono de búsqueda | `<Search className="text-muted-foreground" />` (Lucide) |
| Animación de entrada | `<motion.div>` con Framer Motion |
| Lista animada | `staggerChildren` en el contenedor padre (Framer Motion) |

---

## 11. Modelo de desarrollo — Sprint paralelo FE + BE

```
Sprint N  → FE: vistas nuevas con datos mock (sin conectar BE)
Sprint N  → BE: endpoints reales de las vistas del Sprint N-1
```

- El FE **nunca** espera al BE para avanzar
- El BE siempre va un sprint por detrás del FE
- Las vistas FE nuevas arrancan siempre con datos mock en `features/<f>/data/`

---

## 12. Estado de vistas — aprobación del autor

| Símbolo | Significado |
|---|---|
| `👁️ Pendiente revisión` | Claude ha creado el código. El autor aún no ha revisado visualmente la vista. |
| `✅ Aprobado` | El autor ha revisado la vista en el navegador y da el visto bueno. |

**Regla:** Claude nunca marca una vista como `✅` hasta que el autor confirme explícitamente ("ok", "aprobado", "bien" o similar).

---

## 13. Reglas de negocio específicas

### Filtros del Feed

Los chips de filtro de `BuscadorFiltros` (Todas · Vegano · Keto · Sin gluten · Sin lactosa) son **predefinidos por el autor**. No son generados por el backend ni configurables por el usuario.

- Los chips se definen en `features/recetas/data/datosFeed.ts` → constante `FILTROS_FEED`
- Claude **no inventa** nuevas categorías sin confirmación explícita del autor
- En Sprint 3 se añadirán chips de alérgenos/dietas/dificultad cuando el autor facilite el listado

### Validación Zod en BE

- Todos los endpoints con body usan Zod para validar entrada
- Los errores de validación devuelven `400` con el detalle del campo
- El middleware `validarBody.ts` centraliza la validación (no validar en el controller)

### JWT y autenticación BE

- Los tokens de sesión son JWT firmados con `JWT_SECRET`
- El middleware `autenticacion.ts` protege rutas privadas
- La sesión adjunta `req.usuario = { id, correo, rol }` al request

### Contraseñas

- Siempre hash con `bcrypt` antes de guardar en MongoDB
- Nunca guardar contraseña en texto plano ni en logs

---

## 14. Variables de entorno

| Variable | Dónde | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Base URL del backend para apiClient.ts |
| `NEXTAUTH_SECRET` | `frontend/.env.local` | Firma de sesiones NextAuth |
| `NEXTAUTH_URL` | `frontend/.env.local` | `http://localhost:3000` en dev (no tocar hasta Fase 6) |
| `GOOGLE_CLIENT_ID/SECRET` | `frontend/.env.local` | OAuth Google |
| `MONGODB_URI` | `backend/.env` | Conexión a MongoDB Atlas |
| `JWT_SECRET` | `backend/.env` | Firma de tokens JWT |

**Regla:** nunca hardcodear una URL o secret en el código. Siempre leer de `process.env.*`.

---

## 15. Aliases de importación

```json
{ "paths": { "@/*": ["./src/*"] } }
```

Todos los imports usan `@/` como raíz de `src/`. Nunca rutas relativas largas (`../../../`).
