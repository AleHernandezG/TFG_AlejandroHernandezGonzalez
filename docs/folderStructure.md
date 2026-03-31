# Estructura de Carpetas — `frontend/src`

> **Última actualización:** 2026-03-22 · **Stack:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui

## Árbol

```
src/
├── app/                        # Next.js App Router — rutas, layouts, globals
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/  # Route handler NextAuth (GET + POST)
│   │           └── route.ts
│   ├── registro/               # Ruta /registro
│   │   └── page.tsx
│   ├── fonts/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── favicon.ico
│
├── lib/
│   ├── utils.ts                # Requerido por shadcn/ui (NO mover)
│   └── auth.ts                 # opcionesAuth — NextAuth config centralizada
│
├── components/
│   ├── ui/                     # Primitivas de shadcn/ui (NO mover)
│   └── common/                 # Componentes reutilizables globales (Footer, Navbar…)
│
├── features/                   # Módulos por dominio — patrón "feature-based"
│   ├── <feature>/
│   │   ├── components/         # Componentes propios del feature
│   │   │   └── index.ts        # Barrel export
│   │   ├── hooks/              # Hooks específicos del feature
│   │   ├── data/               # Datos mock / constantes del feature
│   │   └── types/              # Tipos específicos del feature
│   ├── recetas/                # Sprint 2+ — feed, detalle, crear, buscar
│   ├── perfil/                 # Sprint 4+
│   ├── despensa/               # Sprint 5+
│   ├── chat/                   # Sprint 5+
│   └── grupos/                 # Sprint 6+
│
├── hooks/                      # Custom hooks globales compartidos
│
├── stores/                     # Zustand stores globales
│
├── services/                   # Axios instances, TanStack Query wrappers
│
├── types/                      # Tipos TypeScript compartidos entre features
│
├── config/                     # Configuración de la app, constantes globales
│
└── lib/
    ├── utils.ts                # Utilidades requeridas por shadcn/ui (NO mover)
    └── auth.ts                 # opcionesAuth — NextAuth config centralizada (NO mover)
```

## Reglas

### 1. Rutas y layouts → `app/`

Todo lo que Next.js necesita para routing va en `app/`. Seguir la convención de App Router:

- `app/(grupo)/ruta/page.tsx` para páginas
- `app/(grupo)/ruta/layout.tsx` para layouts parciales
- `app/api/` para route handlers

### 2. Feature-based → `features/<nombre>/`

Cada dominio de negocio tiene su propia carpeta en `features/`. Dentro:

| Subcarpeta     | Uso                                           |
| -------------- | --------------------------------------------- |
| `components/`  | Componentes específicos del feature            |
| `hooks/`       | Custom hooks del feature                       |
| `data/`        | Datos mock, constantes, fixtures              |
| `types/`       | Interfaces y tipos del feature                |

**Barrel export:** cada `components/` debe tener un `index.ts` que re-exporte todos los componentes.

```ts
// features/landing/components/index.ts — nombres en español (camelCase)
export { SeccionHero } from "./seccionHero";
export { BentoCaracteristicas } from "./bentoCaracteristicas";
export { BentoTestimonios } from "./bentoTestimonios";

// features/auth/components/index.ts
export { FormularioRegistro } from "./formularioRegistro";
export { BotonGoogle } from "./botonGoogle";
export { DivisorOAuth } from "./divisorOAuth";
```

**Import desde fuera:**

```ts
import { SeccionHero } from "@/features/landing/components";
import { BotonGoogle } from "@/features/auth/components";
```

### 3. Componentes compartidos → `components/`

- **`components/ui/`** — exclusivo para shadcn/ui. No crear componentes propios aquí.
- **`components/common/`** — componentes reutilizables que no pertenecen a un solo feature (ej: `Footer`, `Navbar`, `LoadingSpinner`).

### 4. Global compartido

| Carpeta      | Uso                                                     |
| ------------ | ------------------------------------------------------- |
| `hooks/`     | Hooks usados por 2+ features (ej: `useMediaQuery`)      |
| `stores/`    | Zustand stores globales (ej: `useAuthStore`)            |
| `services/`  | Clientes API, Axios instances, TanStack Query helpers   |
| `types/`     | Tipos compartidos entre features                        |
| `config/`    | Constantes, variables de entorno tipadas                |

### 5. `lib/` — solo utilidades de librerías

`lib/utils.ts` es requerido por shadcn/ui (alias `@/lib/utils`). No añadir más archivos aquí; las utilidades del proyecto deben ir en `hooks/`, `services/` o `config/` según el caso.

## Árbol backend

```
backend/               # Node.js + Express — activo desde Sprint 2
├── src/
│   ├── controllers/
│   ├── models/        # Mongoose schemas
│   ├── repositories/  # Toda la comunicación con MongoDB/Redis
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   └── lib/           # db.ts, redis.ts, jwt.ts
├── .env
└── package.json
```

## Patrón de capas — Backend

Flujo obligatorio: **Route → Controller → Service → Repository → MongoDB/Redis**

### Capa 1 — Routes

Responsabilidad: definir endpoints y aplicar middlewares.
NO pueden contener lógica de negocio ni acceder a modelos.

### Capa 2 — Controllers

Responsabilidad: recibir request validado, llamar al service,
devolver response. Sin lógica de negocio.

### Capa 3 — Services

Responsabilidad: toda la lógica de negocio.
NO acceden a MongoDB directamente — usan el Repository.

### Capa 4 — Repositories (`backend/src/repositories/`)

Responsabilidad: toda la comunicación con MongoDB y Redis.
Si se cambia MongoDB por PostgreSQL, solo se tocan los repositories.

```ts
export const usuarioRepository = {
  crear:           (datos) => Usuario.create(datos),
  buscarPorCorreo: (correo) => Usuario.findOne({ correo }),
  existePorCorreo: async (correo) => !!(await Usuario.exists({ correo })),
  actualizar:      (id, datos) =>
    Usuario.findByIdAndUpdate(id, datos, { new: true }),
}
```

### Capa 5 — Models

Responsabilidad: definir esquemas Mongoose únicamente.
Sin lógica de negocio dentro del modelo.

### Repositories planificados

| Fichero | Modelos | Sprint |
|---|---|---|
| `backend/src/repositories/usuarioRepository.ts` | Usuario | Sprint 2 |
| `backend/src/repositories/tokenRepository.ts` | Token | Sprint 2 |
| `backend/src/repositories/recetaRepository.ts` | Receta, Ingrediente | Sprint 3 |
| `backend/src/repositories/despensaRepository.ts` | Despensa, ItemDespensa | Sprint 6 |
| `backend/src/repositories/grupoRepository.ts` | Grupo, Miembro | Sprint 7 |

## Regla de oro — cambio sin efecto cascada

| Si quiero cambiar… | Solo toco… |
|---|---|
| URL del backend | `src/services/apiClient.ts` |
| Axios por fetch | `src/services/apiClient.ts` |
| MongoDB por PostgreSQL | `backend/src/repositories/*.ts` |
| shadcn por otra UI lib | `src/components/ui/` |
| Zustand por Jotai | `src/stores/*.ts` |
| TanStack Query por SWR | `src/features/*/hooks/*.ts` |
| Gemini por otro modelo IA | `backend/src/services/chatService.ts` |
| Cloudinary por S3 | `backend/src/services/imagenService.ts` |

## Árbol docs/stitch/

```
docs/stitch/              # Diseños de referencia Stitch by Google
├── home/                 # home.png + home.html (Sprint 2)
├── detalleReceta/        # detalleReceta.png + detalleReceta.html (Sprint 2)
├── crearReceta/          # (Sprint 3+)
├── perfil/               # (Sprint 4+)
├── despensa/             # (Sprint 5+)
├── chat/                 # (Sprint 5+)
├── grupos/               # (Sprint 6+)
├── notificaciones/       # (Sprint 6+)
└── ajustes/              # (Sprint 7+)
```

Ver [docs/stitch/LEEME.md](../stitch/LEEME.md) para el flujo completo de uso.

## Aliases (tsconfig)

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Todos los imports usan `@/` como raíz de `src/`.

## Features Actuales

| Feature    | Estado          | Descripción |
| ---------- | --------------- | ----------- |
| `landing`  | ✅              | SeccionHero, BentoCaracteristicas, BentoTestimonios, datos mock |
| `auth`     | 👁️ revisión    | FormularioRegistro, FormularioLogin, FormularioRecuperarContrasena, FormularioNuevaContrasena, TarjetaVerificacionPendiente, TarjetaRecuperacionPendiente, BotonGoogle, DivisorOAuth — Sprint 1 completado, pendiente revisión autor |
| `recetas`  | ⏳ Sprint 2     | Feed, NavBar, Detalle — requiere Stitch previo |
| `perfil`   | ⏳ Sprint 4     | Pendiente |
| `despensa` | ⏳ Sprint 5     | Pendiente |
| `chat`     | ⏳ Sprint 5     | Pendiente |
| `grupos`   | ⏳ Sprint 6     | Pendiente |

## Añadir un Nuevo Feature

1. Crear `features/<nombre>/components/` con un `index.ts`
2. Crear subcarpetas adicionales según se necesiten (`hooks/`, `data/`, `types/`)
3. Importar desde `@/features/<nombre>/components`
4. Actualizar esta tabla
