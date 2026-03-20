# Estructura de Carpetas — `frontend/src`

> **Última actualización:** 2026-03-20 · **Stack:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui

## Árbol

```
src/
├── app/                        # Next.js App Router — rutas, layouts, globals
│   ├── fonts/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── favicon.ico
│
├── components/
│   ├── ui/                     # Primitivas de shadcn/ui (NO mover)
│   └── common/                 # Componentes reutilizables globales (Footer, Navbar…)
│
├── features/                   # Módulos por dominio — patrón "feature-based"
│   └── <feature>/
│       ├── components/         # Componentes propios del feature
│       │   └── index.ts        # Barrel export
│       ├── hooks/              # Hooks específicos del feature
│       ├── data/               # Datos mock / constantes del feature
│       └── types/              # Tipos específicos del feature
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
    └── utils.ts                # Utilidades requeridas por shadcn/ui (NO mover)
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
// features/landing/components/index.ts
export { LandingHeader } from "./landing-header";
export { HeroSection } from "./hero-section";
export { FeaturesBento } from "./features-bento";
```

**Import desde fuera:**

```ts
import { HeroSection } from "@/features/landing/components";
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

| Feature   | Estado | Descripción                                      |
| --------- | ------ | ------------------------------------------------- |
| `landing` | ✅     | Hero, header, features bento, datos mock          |

## Añadir un Nuevo Feature

1. Crear `features/<nombre>/components/` con un `index.ts`
2. Crear subcarpetas adicionales según se necesiten (`hooks/`, `data/`, `types/`)
3. Importar desde `@/features/<nombre>/components`
4. Actualizar esta tabla
