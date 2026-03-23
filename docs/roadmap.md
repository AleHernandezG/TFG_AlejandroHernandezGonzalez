# Roadmap — Cookr (TFG)
> Red Social Gastronómica con IA · Stack MERN + PWA · 2024-2025

---

## 1. Fases del Proyecto

| Fase | Semanas | Tipo | Entregable |
|---|---|---|---|
| Fase 0: Setup | Sem 1 | Setup | Repo, estructura, ESLint, CI/CD básico |
| Fase 1: Autenticación (FE) | Sem 2-3 | Frontend | Landing, Login, Registro, OAuth con NextAuth |
| Fase 2: Core UI — Recetas (FE) | Sem 4-6 | Frontend | Home, feed, detail view, crear receta, buscar |
| Fase 3: Features Avanzadas (FE) | Sem 7-9 | Frontend | Despensa, Chat IA, Grupos, Perfil, Ajustes |
| Fase 4: Backend — API REST | Sem 10-12 | Backend | Express API, MongoDB, autenticación, endpoints |
| Fase 5: Integración FE↔BE | Sem 13-14 | Integración | Conectar Axios/TanStack Query al API real, JWT |
| Fase 6: APIs Externas + PWA | Sem 15-16 | Integración | Gemini, Edamam, Cloudinary, Service Worker, deploy |
| Fase 7: QA y Documentación | Sem 17-18 | Pendiente | Tests, performance, memoria TFG, presentación |

> **Importante:** Las fases 1-3 usan datos mock. Solo en la Fase 5 se conecta el backend.

---

## 1.1 Pantallas → Fase y Sprint

| Pantalla | Fase | Sprint |
|---|---|---|
| Landing Page | Fase 1 (Auth) | Sprint 1 |
| Registro / Inicio de Sesión | Fase 1 (Auth) | Sprint 1 |
| Home / Feed | Fase 2 (Core) | Sprint 3 |
| Vista Detalle Receta | Fase 2 (Core) | Sprint 3 |
| Crear / Nuevo Post (Receta) | Fase 2 (Core) | Sprint 4 |
| Despensa | Fase 3 (Avanzado) | Sprint 6 |
| Chat IA | Fase 3 (Avanzado) | Sprint 6 |
| Vista Grupo | Fase 3 (Avanzado) | Sprint 7 |
| Perfil + Recetas Guardadas | Fase 3 (Avanzado) | Sprint 7 |
| Ajustes | Fase 3 (Avanzado) | Sprint 8 |
| Help / Preguntas | Fase 3 (Avanzado) | Sprint 8 |

---

## 2. Épicas

| ID | Épica | Descripción | Sprints |
|---|---|---|---|
| E1 | Autenticación | Registro, login, OAuth, sesiones y perfil básico | 1-2 |
| E2 | Recetas | CRUD completo, búsqueda, filtros, detalle, fork | 3-4 |
| E3 | Nutrición | Integración Edamam, cálculo automático, info nutricional | 4-5 |
| E4 | Despensa | Inventario personal, añadir/quitar, caducidades | 5-6 |
| E5 | Chat IA | Asistente Gemini con contexto de despensa | 6 |
| E6 | Social | Grupos, seguir usuarios, notificaciones, likes | 7 |
| E7 | PWA + UX | Modo manos libres, offline, instalación, animaciones | 8 |
| E8 | Backend API | Express, MongoDB, Redis, todos los endpoints | 9-12 |
| E9 | Integración | Conectar FE real, Cloudinary, Resend, deploy | 13-15 |

---

## 3. Sprints detallados — Frontend (Sprints 1-8)

### Sprint 1 — Setup + Autenticación

| Historia de Usuario | Criterios de Aceptación | Puntos | Épica |
|---|---|---|---|
| Como usuario quiero registrarme con email y contraseña | Formulario valida en tiempo real con Zod. Feedback claro de errores | 5 pts | E1 |
| Como usuario quiero iniciar sesión con Google | Botón OAuth visible. Redirige correctamente. Token guardado en Zustand | 3 pts | E1 |
| Como usuario quiero ver la landing page | Hero, CTA, 3 features. Responsive. Animada con Framer Motion | 3 pts | E1 |
| Como dev quiero ESLint + Prettier + alias de paths | npm run lint pasa sin errores. Alias @/ funciona. Pre-commit hook activo | 2 pts | E1 |

### Sprint 2 — Perfil + Navegación Global

| Historia de Usuario | Criterios de Aceptación | Puntos | Épica |
|---|---|---|---|
| Como usuario quiero editar mi perfil (nombre, foto, bio) | Upload Cloudinary (mock). Preview en tiempo real. Guardado con feedback | 5 pts | E1 |
| Como usuario quiero una barra de navegación inferior mobile-first | Nav visible en todas las páginas excepto landing. Iconos Lucide. Active state | 3 pts | E7 |
| Como usuario quiero ver mis recetas guardadas en el perfil | Grid de recetas guardadas. Estado vacío con CTA. Datos mock | 3 pts | E2 |

### Sprint 3 — Home + Feed de Recetas

| Historia de Usuario | Criterios de Aceptación | Puntos | Épica |
|---|---|---|---|
| Como usuario quiero ver un feed de recetas populares | Cards con imagen, título, autor, likes. Scroll infinito mock. Skeleton loaders | 8 pts | E2 |
| Como usuario quiero buscar recetas por nombre o ingrediente | Barra de búsqueda con debounce. Resultados en tiempo real. Estado vacío | 5 pts | E2 |
| Como usuario quiero filtrar recetas por dificultad, tiempo o tipo | Drawer de filtros. Multi-selección. Badge con número de filtros activos | 3 pts | E2 |

### Sprint 4 — Detalle Receta + Crear Receta

| Historia de Usuario | Criterios de Aceptación | Puntos | Épica |
|---|---|---|---|
| Como usuario quiero ver el detalle completo de una receta | Imagen hero. Tabs: ingredientes/pasos/info. Botón de like y guardar. Comentarios mock | 8 pts | E2 |
| Como usuario quiero crear una receta con pasos e imágenes | Formulario multi-step. Añadir/reordenar pasos drag-and-drop. Preview antes de publicar | 8 pts | E2 |
| Como usuario quiero activar el Modo Manos Libres | Botón activa TTS. Lee paso a paso. Wake Lock activado. Controles de voz visibles | 5 pts | E7 |

### Sprints 5-8 — Resumen

| Sprint | Épica | Historias principales |
|---|---|---|
| Sprint 5 | E3 + E4 FE | Info nutricional, itemDespensa, añadir/quitar, caducidades |
| Sprint 6 | E5 + E4 | Chat Gemini mock, historial mensajes, contexto despensa |
| Sprint 7 | E6 Social | Grupos: crear/unirse/salir, seguir usuarios, notificaciones UI |
| Sprint 8 | E7 PWA + Ajustes | Service Worker, manifest, instalación, ajustes cuenta, Help |

### Sprints 9-15 — Backend e Integración

| Sprint | Épica | Historias principales |
|---|---|---|
| Sprint 9-10 | E8 Backend Auth + Recetas | Express setup, MongoDB, NextAuth backend, CRUD recetas |
| Sprint 11 | E8 Backend Social | Endpoints grupos, notificaciones, seguidores, Redis cache |
| Sprint 12 | E8 Backend AI + Despensa | Gemini API, Edamam, endpoints despensa y chat |
| Sprint 13-14 | E9 Integración | Conectar FE, Axios interceptors, TanStack Query real |
| Sprint 15 | E9 Deploy + QA | Vercel, Render, CI/CD, tests E2E básicos, documentación |

---

## 4. Herramienta ágil — Linear

- **Workspace:** TFG Gastronómica
- **Projects:** Frontend Core / Backend API / Integración
- **Cycles:** Sprints de 2 semanas
- **Labels:** Frontend, Backend, Bug, Documentación, Bloqueo
- **Estimates:** Puntos de historia (Fibonacci: 1, 2, 3, 5, 8)

### Formato de Issue en Linear

```
Título: [E2] Como usuario, quiero ver el detalle de una receta

Tipo: Historia de Usuario
Épica: E2 — Recetas
Sprint: Sprint 4
Estimación: 8 puntos
Prioridad: Alta
Labels: Frontend

DESCRIPCIÓN
Como usuario autenticado,
quiero ver la página de detalle de una receta
para conocer ingredientes, pasos, nutrición y comentarios.

CRITERIOS DE ACEPTACIÓN
✅ Imagen hero con gradiente y nombre de la receta visible
✅ Tabs funcionales: Ingredientes | Pasos | Nutrición
✅ Botón "Guardar" actualiza el estado en Zustand
✅ Botón "Like" cambia icono con animación (optimistic UI)
✅ Responsive: mobile ≤ 768px, desktop > 768px
✅ Skeleton loader mientras carga

COMPONENTES AFECTADOS
/app/recetas/[id]/page.jsx
/components/receta/RecetaHero.jsx
/components/receta/TabsNutricion.jsx

NOTAS TÉCNICAS
- Usar datos mock de /mocks/receta.json hasta Sprint 13
- TanStack Query: queryKey: ['receta', id]
```

---

## 5. Sistema de documentación para Claude

### Ficheros de contexto

| Fichero | Dónde | Cuándo adjuntarlo |
|---|---|---|
| `context.md` | `docs/context.md` | SIEMPRE al inicio de cada sesión |
| `infraestructura.md` | `docs/infraestructura.md` | Cuando haya dudas de stack o arquitectura |
| `roadmap.md` | `docs/roadmap.md` | Cuando haya dudas de planificación o criterios |
| `ui-changes.md` | `docs/changes/` | Cuando vayas a cambiar algo visual |
| `api-changes.md` | `docs/changes/` | Cuando cambie un endpoint o hook |
| `domain-changes.md` | `docs/changes/` | Cuando cambie el modelo de datos |

### Sistema de IDs para cambios

| Prefijo | Tipo de cambio | Fichero |
|---|---|---|
| `[UI-XXX]` | Vistas, componentes, layouts | `ui-changes.md` |
| `[API-XXX]` | Endpoints, contratos, hooks | `api-changes.md` |
| `[DOM-XXX]` | Modelo de dominio, schemas | `domain-changes.md` |

### Estados de cambio

| Estado | Significado | Acción |
|---|---|---|
| ⏳ Pendiente | Decidido, no implementado | Añadir al backlog de Linear |
| 🔄 En Progreso | Implementándose en el sprint activo | Issue activa en Linear |
| ✅ Completado | Implementado y en rama main | No requiere acción |
| 🚫 Descartado | Se decidió no implementar | Documentar el motivo |

> **Regla de oro:** nunca edites una entrada completada. Si el cambio evoluciona, crea una nueva entrada ([UI-004] en vez de editar [UI-001]).

---

## 6. Estructura de carpetas del proyecto

```
TFG_AlejandroHernandezGonzalez/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/registro/
│   │   │   ├── (auth)/login/
│   │   │   ├── recetas/[id]/
│   │   │   ├── despensa/
│   │   │   ├── chat/
│   │   │   ├── grupos/
│   │   │   └── perfil/[username]/
│   │   ├── components/
│   │   │   ├── ui/          ← shadcn/ui (no tocar)
│   │   │   ├── receta/
│   │   │   ├── despensa/
│   │   │   ├── chat/
│   │   │   └── shared/      ← Nav, Header, Skeleton...
│   │   ├── hooks/           ← Custom hooks
│   │   ├── store/           ← Zustand
│   │   ├── lib/
│   │   │   ├── axios.js     ← instancia configurada
│   │   │   └── validations/ ← schemas Zod
│   │   └── mocks/           ← JSON para desarrollo FE
├── backend/                 ← vacío hasta Fase 4
└── docs/
    ├── context.md           ← actualizar cada sesión
    ├── infraestructura.md
    ├── roadmap.md
    ├── changes/
    │   ├── ui-changes.md
    │   ├── api-changes.md
    │   └── domain-changes.md
    └── phase-reports/
```

---

## 7. Variables de entorno (.env.local)

```bash
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Backend (Fase 4)
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Servicios externos (Fase 6)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
GEMINI_API_KEY=
EDAMAM_APP_ID=
EDAMAM_APP_KEY=
RESEND_API_KEY=
```

---

## 8. Commits — Conventional Commits

```
feat(auth): añadir login con Google OAuth
fix(recetas): corregir scroll infinito en iOS Safari
style(home): ajustar espaciado cards en mobile
refactor(hooks): extraer lógica de paginación a usePagination
docs(api): documentar endpoint POST /api/recetas
chore(deps): actualizar tanstack-query a 5.28.0
```
