# Estructura de Carpetas — Cookr TFG

> **Última actualización:** 2026-04-17 · **Stack:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui

> Reglas de arquitectura, nomenclatura, barrel exports y patrón de capas → `docs/rules.md`

---

## Árbol frontend — `frontend/src`

```
src/
├── app/                        # Next.js App Router — rutas, layouts, globals
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/  # Route handler NextAuth (GET + POST)
│   │           └── route.ts
│   ├── (main)/                 # Grupo de rutas con NavBarInferior
│   │   ├── home/               # Ruta /home (feed)
│   │   │   └── page.tsx
│   │   ├── coleccion/          # Ruta /coleccion — Guardadas + Mis recetas [UI-020]
│   │   │   └── page.tsx
│   │   ├── recetas/
│   │   │   └── [id]/           # Ruta /recetas/[id] — detalle de receta
│   │   │       └── page.tsx
│   │   └── layout.tsx          # Añade NavBarInferior a todas las rutas del grupo
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
│   └── auth.ts                 # opcionesAuth — NextAuth config centralizada (NO mover)
│
├── components/
│   ├── ui/                     # Primitivas de shadcn/ui (NO añadir componentes propios aquí)
│   └── common/                 # Componentes reutilizables globales (PiePagina, NavBar…)
│
├── features/                   # Módulos por dominio — patrón "feature-based"
│   ├── landing/
│   │   └── components/
│   │       ├── seccionHero.tsx
│   │       ├── bentoCaracteristicas.tsx
│   │       ├── bentoTestimonios.tsx
│   │       ├── tarjetaTestimonio.tsx
│   │       └── index.ts
│   ├── auth/
│   │   ├── components/
│   │   │   ├── formularioRegistro.tsx
│   │   │   ├── formularioLogin.tsx
│   │   │   ├── formularioRecuperarContrasena.tsx
│   │   │   ├── formularioNuevaContrasena.tsx
│   │   │   ├── tarjetaVerificacionPendiente.tsx
│   │   │   ├── tarjetaRecuperacionPendiente.tsx
│   │   │   ├── botonGoogle.tsx
│   │   │   ├── divisorOAuth.tsx
│   │   │   └── index.ts
│   │   └── types/
│   │       └── autenticacion.ts
│   ├── recetas/
│   │   ├── components/
│   │   │   ├── home/           # Componentes exclusivos de /home (feed)
│   │   │   │   ├── drawerFiltros.tsx   # Drawer vaul: Dieta + Dificultad + Alérgenos
│   │   │   │   ├── feedHome.tsx
│   │   │   │   ├── feedHomePc.tsx
│   │   │   │   ├── headerHome.tsx
│   │   │   │   ├── headerHomePc.tsx
│   │   │   │   ├── layoutHomePc.tsx
│   │   │   │   ├── sidebarNavPc.tsx
│   │   │   │   ├── sidebarTendencias.tsx
│   │   │   │   ├── tarjetaPost.tsx
│   │   │   │   ├── tarjetaPostPc.tsx
│   │   │   │   └── index.ts
│   │   │   ├── detalleReceta/  # Componentes exclusivos de /recetas/[id]
│   │   │   │   ├── cabeceraReceta.tsx
│   │   │   │   ├── carruselSimilares.tsx
│   │   │   │   ├── comentariosReceta.tsx
│   │   │   │   ├── detalleRecetaCliente.tsx
│   │   │   │   ├── heroReceta.tsx
│   │   │   │   ├── pasosReceta.tsx
│   │   │   │   ├── tabsReceta.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts        # Barrel raíz — re-exporta home/ y detalleReceta/
│   │   ├── data/
│   │   │   ├── datosFeed.ts    # Incluye constante FILTROS_FEED
│   │   │   ├── datosDetalle.ts
│   │   │   └── datosTendencias.ts
│   │   └── types/
│   │       └── receta.types.ts
│   ├── perfil/                 # Sprint 4+
│   ├── despensa/               # Sprint 5+
│   ├── chat/                   # Sprint 5+
│   └── grupos/                 # Sprint 6+
│
├── hooks/                      # Custom hooks globales (usados por 2+ features)
│   └── useDebounce.ts          # useDebounce<T>(value, delay) — Sprint 3 [UI-016b]
├── stores/                     # Zustand stores globales
├── services/                   # apiClient.ts + *Service.ts
│   ├── apiClient.ts
│   └── authService.ts
├── types/                      # Tipos TypeScript compartidos entre features
└── config/                     # Constantes y variables de entorno tipadas
    └── opcionesUsuario.ts      # ALERGENOS_OPCIONES (14) + DIETAS_OPCIONES (10) — fuente única
```

---

## Árbol backend — `backend/src`

```
backend/src/
├── controllers/           # Reciben request, devuelven response
├── models/                # Schemas Mongoose — importa interfaces de types/
│   ├── usuarioMongo.ts    # IUsuarioDoc extends IUsuario, Document
│   └── tokenMongo.ts      # ITokenDoc extends IToken, Document
├── repositories/          # Toda la comunicación con MongoDB
│   ├── usuarioRepository.ts
│   └── tokenRepository.ts
├── routes/                # Definición de endpoints y middlewares
├── middlewares/           # Validación, autenticación, errores
├── services/              # Lógica de negocio
├── types/                 # Interfaces de dominio puras (sin acoplamiento a Mongoose)
│   ├── usuario.ts         # IUsuario
│   └── token.ts           # IToken
└── lib/                   # db.ts, jwt.ts, validadores.ts, email.ts
```

---

## Árbol raíz del proyecto

```text
TFG_AlejandroHernandezGonzalez/
├── frontend/              # Next.js 14 App Router
├── backend/               # Express + TypeScript
├── docs/                  # Documentación del proyecto
└── scripts/               # Scripts de desarrollo y operaciones
    ├── dev.sh             # Arranca FE (:3000) + BE (:4000) en paralelo  [DEV-001]
    ├── lint.sh            # tsc --noEmit (BE) + next lint (FE) secuencial
    ├── build.sh           # tsc (BE) + next build (FE) secuencial
    └── keep-alive.sh      # Ping a Render antes de demos (evita cold start) [DEV-002]
```

### Repositories planificados

| Fichero | Modelos | Sprint |
|---|---|---|
| `usuarioRepository.ts` | Usuario | ✅ Sprint 2 |
| `tokenRepository.ts` | Token | ✅ Sprint 2 |
| `recetaRepository.ts` | Receta, Ingrediente | Sprint 3 |
| `despensaRepository.ts` | Despensa, ItemDespensa | Sprint 6 |
| `grupoRepository.ts` | Grupo, Miembro | Sprint 7 |

---

## Aliases (tsconfig)

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Todos los imports usan `@/` como raíz de `src/`.

---

## Features actuales

| Feature | Estado | Componentes |
|---|---|---|
| `landing` | ✅ Aprobado | SeccionHero, BentoCaracteristicas, BentoTestimonios |
| `auth` | 👁️ revisión | FormularioRegistro, FormularioLogin, BotonGoogle, DivisorOAuth, +4 |
| `recetas` | ✅ Aprobado | `home/` ×10 (FeedHome, DrawerFiltros, TarjetaPost…) · `detalleReceta/` ×7 · `/coleccion` (page) |
| `perfil` | ⏳ Sprint 4 | Pendiente |
| `despensa` | ⏳ Sprint 5 | Pendiente |
| `chat` | ⏳ Sprint 5 | Pendiente |
| `grupos` | ⏳ Sprint 6 | Pendiente |

## Añadir un nuevo feature

1. Crear `features/<nombre>/components/` con un `index.ts` barrel
2. Crear subcarpetas adicionales según se necesiten (`hooks/`, `data/`, `types/`)
3. Importar siempre desde el barrel raíz: `@/features/<nombre>/components`
4. Actualizar la tabla de features actuales
