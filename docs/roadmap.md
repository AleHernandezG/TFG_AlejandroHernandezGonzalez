# Roadmap — Cookr (TFG)
> Red Social Gastronómica con IA · Stack MERN + PWA · 2024-2025
> **Actualizado:** 2026-04-20 — Sprint 3 en curso; colección adelantada a Sprint 3

---

## Modelo de desarrollo

```
Cada sprint = FE nuevo (mock) + BE del sprint anterior (real) + BD necesaria

Sprint N:
  ├── FE: nuevas vistas en mock
  └── BE: vistas del sprint anterior conectadas a real + modelos MongoDB necesarios
```

> El despliegue online se mantiene al final (Fase 6).

---

## 1. Fases del Proyecto

| Fase | Tipo | Contenido |
|---|---|---|
| Fase 0: Setup | Setup | Repo, estructura, ESLint, CI/CD básico — ✅ Completada |
| Fase 1: Auth FE | Frontend | Landing, Login, Registro, OAuth — ✅ Completada |
| Fase 2-5: FE + BE paralelo | FE + BE | Cada sprint: vistas nuevas mock + backend sprint anterior |
| Fase 6: APIs Externas + PWA + Deploy | Integración | Gemini, Edamam, Cloudinary, Service Worker, Vercel + Render |
| Fase 7: QA y Documentación | QA | Tests, performance, memoria TFG, presentación |

---

## 2. Pantallas → Sprint

| Pantalla | Sprint FE (mock) | Sprint BE (real) |
|---|---|---|
| Landing Page | Sprint 1 ✅ | — sin backend |
| Registro / Login / Recuperar contraseña | Sprint 1 ✅ | Sprint 2 |
| Home / Feed de recetas | Sprint 2 | Sprint 3 |
| NavBar inferior | Sprint 2 | — sin backend |
| Detalle de receta | Sprint 2 | Sprint 3 |
| Buscar recetas | Sprint 3 ✅ | Sprint 4 |
| Filtros de recetas | Sprint 3 ✅ | Sprint 4 |
| Colección (Guardadas + Mis recetas) | Sprint 3 ✅ adelantado | Sprint 5 |
| Crear receta | Sprint 3 | Sprint 4 |
| Perfil de usuario | Sprint 4 | Sprint 5 |
| Recetas guardadas (persistente) | Sprint 4 → conectar BE | Sprint 5 |
| Despensa virtual | Sprint 5 | Sprint 6 |
| Chat IA (Gemini) | Sprint 5 | Fase 6 |
| Grupos / Comunidades | Sprint 6 | Sprint 7 |
| Notificaciones | Sprint 6 | Sprint 7 |
| Ajustes | Sprint 7 | Sprint 8 |
| Help / Preguntas | Sprint 7 | Sprint 8 |
| Modo Manos Libres (TTS) | Sprint 8 | — sin backend |

---

## 3. Épicas

| ID | Épica | Descripción | Sprints FE | Sprints BE |
|---|---|---|---|---|
| E1 | Autenticación | Registro, login, OAuth, recuperar contraseña | 1 ✅ | 2 |
| E2 | Recetas | CRUD completo, feed, detalle, búsqueda, filtros | 2-3 | 3-4 |
| E3 | Nutrición | Edamam, cálculo automático, info nutricional | 5 | Fase 6 |
| E4 | Despensa | Inventario personal, añadir/quitar, caducidades | 5 | 6 |
| E5 | Chat IA | Asistente Gemini con contexto despensa | 5 | Fase 6 |
| E6 | Social | Grupos, seguir usuarios, notificaciones, likes | 6 | 7 |
| E7 | Perfil + UX | Perfil, recetas guardadas, ajustes | 4 | 5 |
| E8 | PWA | Modo manos libres, offline, instalación | 8 | — |
| E9 | Deploy | Vercel, Render, CI/CD, OAuth producción | — | Fase 6 |

---

## 4. Sprints detallados

---

### Sprint 1 — Auth FE ✅ COMPLETADO

**Tipo:** Solo Frontend mock

| Tarea | Estado | Puntos |
|---|---|---|
| Landing Page | ✅ | 3 pts |
| Registro con email + Google OAuth | ✅ | 5 pts |
| Login con email + Google OAuth | ✅ pendiente revisión visual | 3 pts |
| Recuperar contraseña (3 vistas) | ✅ pendiente revisión visual | 3 pts |
| Verificar email (2 vistas mock) | ✅ | 2 pts |
| Setup ESLint + Prettier + alias | ✅ | 2 pts |

---

### Sprint 2 — Home + Feed + Detalle FE / Auth BE

**Tipo:** FE nuevas vistas mock + BE Sprint 1 real + BD Auth

#### FE — Nuevas vistas mock

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Home / Feed de recetas | Cards con imagen, título, autor, likes. Skeleton loaders. Scroll infinito mock | 8 pts | E2 |
| Barra de navegación inferior | Visible en todas excepto landing. Iconos Lucide. Active state brand. Mobile-first | 3 pts | E2 |
| Detalle de receta | Imagen hero. Tabs: ingredientes / pasos / nutrición. Like y guardar. Comentarios mock | 8 pts | E2 |

#### BE — Auth real Sprint 1 conectado

| Tarea | Descripción | Puntos |
|---|---|---|
| Setup Express + estructura backend | Proyecto Node/Express, capas, middlewares base (cors, helmet, morgan) | 3 pts |
| MongoDB: modelo Usuario | nombre, correo, contraseña (bcrypt), foto, rol, cuentaVerificada, fechaRegistro, alergias, preferencias | 3 pts |
| MongoDB: modelo Token | userId, token JWT firmado, tipo (verificacion / recuperacion), expira (TTL index), usado | 2 pts |
| Endpoint POST /api/auth/registro | Zod validación, bcrypt hash, guardar Usuario, generar Token verificación | 5 pts |
| Endpoint POST /api/auth/login | Verificar credenciales, bcrypt.compare, devolver JWT de sesión | 3 pts |
| Endpoint POST /api/auth/verificar-email | Validar token JWT, cuentaVerificada=true, invalidar token | 2 pts |
| Endpoint POST /api/auth/recuperar-contrasena | Generar token JWT 1h, guardar en Token, email mock por ahora | 3 pts |
| Endpoint POST /api/auth/nueva-contrasena | Validar token, bcrypt nueva contraseña, invalidar token | 3 pts |
| JWT Middleware | Verificar token en rutas protegidas, adjuntar usuario al request | 2 pts |
| Zod validadores backend | Schemas registro, login, recuperación — segunda capa de validación | 2 pts |

**BD necesaria este sprint:**
- Colección `usuarios` — índice único en `correo`
- Colección `tokens` — TTL index en `expira` (MongoDB borra automáticamente)

---

### Sprint 3 — Buscar + Filtrar + Crear Receta FE / Feed + Detalle BE

**Tipo:** FE nuevas vistas mock + BE Sprint 2 FE real

#### FE — Nuevas vistas mock

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Buscar recetas | Barra búsqueda con debounce. Resultados en tiempo real. Estado vacío | 5 pts | E2 |
| Filtrar recetas | Drawer filtros. Multi-selección. Badge número activos | 3 pts | E2 |
| Crear receta | Formulario multi-step. Drag-and-drop pasos. Preview antes de publicar | 8 pts | E2 |

#### BE — Feed + Detalle real Sprint 2 FE conectado

| Tarea | Descripción | Puntos |
|---|---|---|
| MongoDB: modelo Receta | nombre, descripción, pasos, ingredientes, imagenUrl, autor, likes, dificultad, tiempo, filtros, esBorrador | 3 pts |
| MongoDB: modelo Ingrediente | nombre, categoría, alérgenos, imagenUrl | 2 pts |
| Endpoint GET /api/recetas | Feed paginado por cursor, filtros opcionales, ordenado popularidad | 5 pts |
| Endpoint GET /api/recetas/:id | Detalle completo con datos del autor | 3 pts |
| Endpoint POST /api/recetas/:id/like | Toggle like | 2 pts |
| Redis cache feed popular | Cache 5 min para GET /api/recetas | 3 pts |
| Conectar FE Auth con BE real | Sustituir mocks login/registro por llamadas reales | 5 pts |

**BD necesaria este sprint:**
- Colección `recetas` — índices en `autor`, `filtros`, `likes`
- Colección `ingredientes`
- Setup Upstash Redis

---

### Sprint 4 — Perfil + Recetas Guardadas FE / Buscar + Crear Receta BE

#### FE — Nuevas vistas mock

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Perfil de usuario | Avatar, nombre, bio. Editar inline. Upload foto mock | 5 pts | E7 |
| Recetas guardadas | Grid 2col mobile / 3col desktop. Estado vacío con CTA | 3 pts | E7 |
| Editar / eliminar receta propia | Botones en detalle si eres el autor. Confirmación borrado | 5 pts | E2 |

#### BE — Buscar + Crear Receta real Sprint 3 FE conectado

| Tarea | Descripción | Puntos |
|---|---|---|
| Endpoint GET /api/recetas/buscar | Búsqueda texto + filtros. Índice texto MongoDB | 5 pts |
| Endpoint POST /api/recetas | Crear receta, Zod validación, Cloudinary mock URL | 5 pts |
| Endpoint PUT /api/recetas/:id | Editar receta (solo autor) | 3 pts |
| Endpoint DELETE /api/recetas/:id | Eliminar receta (solo autor) | 2 pts |
| MongoDB: modelo RecetaGuardada | userId + recetaId + fechaGuardado | 2 pts |
| Endpoint POST /api/recetas/:id/guardar | Toggle guardar receta | 2 pts |

---

### Sprint 5 — Despensa + Chat IA FE / Perfil BE

#### FE — Nuevas vistas mock

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Despensa virtual | Lista items. Añadir/quitar. Caducidades. Badge alerta | 8 pts | E4 |
| Chat IA mock | Burbujas chat. Input mensaje. Historial local. Typing indicator | 8 pts | E5 |

#### BE — Perfil real Sprint 4 FE conectado

| Tarea | Descripción | Puntos |
|---|---|---|
| Endpoint GET /api/usuarios/:username | Perfil público | 3 pts |
| Endpoint PUT /api/usuarios/perfil | Editar nombre, bio, foto mock | 3 pts |
| Endpoint GET /api/usuarios/guardadas | Recetas guardadas del usuario | 3 pts |

---

### Sprint 6 — Grupos + Notificaciones FE / Despensa BE

#### FE — Nuevas vistas mock

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Vista Grupos | Feed grupos. Detalle con recetas. Unirse/salir | 8 pts | E6 |
| Notificaciones | Lista notificaciones. Badge contador. Marcar leída | 5 pts | E6 |
| Seguir usuarios | Botón seguir en perfil. Lista seguidores/seguidos | 3 pts | E6 |

#### BE — Despensa real Sprint 5 FE conectado

| Tarea | Descripción | Puntos |
|---|---|---|
| MongoDB: modelo Despensa | userId + items (ingrediente, cantidad, unidad, caducidad, esFavorito) | 3 pts |
| Endpoint GET /api/despensa | Obtener despensa del usuario | 2 pts |
| Endpoint POST /api/despensa | Añadir item | 2 pts |
| Endpoint DELETE /api/despensa/:itemId | Quitar item | 2 pts |
| Endpoint GET /api/despensa/recetas-posibles | Recetas con ingredientes disponibles | 5 pts |

---

### Sprint 7 — Ajustes + Help FE / Grupos + Notificaciones BE

#### FE — Nuevas vistas mock

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Ajustes | Tema, notificaciones, privacidad, cerrar sesión, eliminar cuenta | 5 pts | E7 |
| Help / FAQ | FAQ buscable. Sección tutorial | 3 pts | E7 |

#### BE — Grupos + Notificaciones real Sprint 6 FE conectado

| Tarea | Descripción | Puntos |
|---|---|---|
| MongoDB: modelo Grupo | nombre, descripción, imagenUrl, filtros, miembros, numRecetas | 3 pts |
| MongoDB: modelo Miembro | grupoId + userId + rol + fechaUnion | 2 pts |
| MongoDB: modelo Notificacion | userId + tipo + mensaje + leida + fechaCreacion | 2 pts |
| Endpoint GET /api/grupos | Feed grupos con filtros | 3 pts |
| Endpoint POST /api/grupos/:id/unirse | Unirse a un grupo | 2 pts |
| Endpoint GET /api/notificaciones | Notificaciones del usuario | 2 pts |
| Endpoint PUT /api/notificaciones/:id/leer | Marcar como leída | 1 pt |
| Endpoint POST /api/usuarios/:id/seguir | Toggle seguir usuario | 2 pts |

---

### Sprint 8 — PWA + Modo Manos Libres FE / Ajustes BE + Pulido

#### FE

| Historia | Criterios de aceptación | Puntos | Épica |
|---|---|---|---|
| Modo Manos Libres | TTS lee pasos. Wake Lock. Controles voz | 8 pts | E8 |
| Service Worker | Caché recetas visitadas. Funciona offline | 5 pts | E8 |
| PWA Manifest | Instalable en móvil. Icono. Modo standalone | 2 pts | E8 |

#### BE — Ajustes + limpieza

| Tarea | Descripción | Puntos |
|---|---|---|
| Endpoint PUT /api/usuarios/ajustes | Preferencias notificaciones, privacidad | 3 pts |
| Endpoint DELETE /api/usuarios | Eliminar cuenta soft delete | 2 pts |
| Rate limiting | express-rate-limit en rutas auth y IA | 2 pts |
| Redis: revisar TTLs y caches | Optimización general | 3 pts |

---

### Fase 6 — APIs Externas + Deploy

| Tarea | Descripción |
|---|---|
| Gemini API real | Conectar Chat IA + contexto despensa |
| Edamam API | Cálculo nutricional al crear/editar recetas |
| Cloudinary | Upload real imágenes recetas y avatares |
| Resend | Emails verificación y recuperación contraseña |
| next-pwa migración | next-pwa@5 → @ducanh2912/next-pwa (ver tech-debt.md DEBT-001) |
| Next.js 14 → 15 | Migración + ESLint v9 (ver tech-debt.md DEBT-001) |
| Vercel deploy | Frontend en producción |
| Render | Backend en producción — Deploy Hook desde GitHub Actions (ver fase-0-pendientes.md SETUP-006) |
| GitHub Actions CI/CD | Workflow lint + deploy (ver fase-0-pendientes.md SETUP-001) |
| OAuth producción | NEXTAUTH_URL + Google Cloud Console (ver api-changes.md API-003) |

---

### Fase 7 — QA y Documentación TFG

| Tarea | Descripción |
|---|---|
| Tests E2E básicos | Flujos críticos: registro, login, crear receta, buscar |
| Performance | Lighthouse, Core Web Vitals |
| Memoria TFG | Documentación académica completa |
| Presentación | Slides + demo en vivo |

---

## 5. Sistema de documentación para Claude

| Fichero | Dónde | Cuándo adjuntarlo |
|---|---|---|
| `context.md` | `docs/` | SIEMPRE al inicio de cada sesión |
| `infraestructura.md` | `docs/` | Dudas de stack o arquitectura |
| `roadmap.md` | `docs/` | Dudas de planificación o criterios |
| `folderStructure.md` | `docs/` | Dudas de estructura de carpetas |
| `ui-changes.md` | `docs/changes/` | Cambios visuales |
| `api-changes.md` | `docs/changes/` | Cambios de endpoints |
| `domain-changes.md` | `docs/changes/` | Cambios de modelo de datos |

### Sistema de IDs

| Prefijo | Tipo | Fichero |
|---|---|---|
| `[UI-XXX]` | Vistas, componentes, layouts | `ui-changes.md` |
| `[API-XXX]` | Endpoints, contratos, hooks | `api-changes.md` |
| `[DOM-XXX]` | Modelo de dominio, schemas | `domain-changes.md` |
| `[AUTH-XXX]` | TODOs de autenticación | `fase-1-completados.md` |
| `[SETUP-XXX]` | Setup y deploy | `fase-0-pendientes.md` |
| `[DEBT-XXX]` | Deuda técnica | `tech-debt.md` |

### Estados

| Estado | Significado |
|---|---|
| ⏳ Pendiente | Decidido, no implementado |
| 🔄 En Progreso | En el sprint activo |
| ✅ Completado | En rama main, aprobado por el autor |
| 🚫 Descartado | No se implementa |
| 👁️ Pendiente revisión | Implementado por Claude, pendiente aprobación |

> Claude nunca marca ✅ sin confirmación explícita del autor.

---

## 6. Variables de entorno

### Frontend (.env.local)

```bash
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # Fase 6
```

### Backend (.env)

```bash
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=
UPSTASH_REDIS_URL=                   # Sprint 3+
UPSTASH_REDIS_TOKEN=                 # Sprint 3+
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=                      # Fase 6
EDAMAM_APP_ID=                       # Fase 6
EDAMAM_APP_KEY=                      # Fase 6
RESEND_API_KEY=                      # Fase 6
CLOUDINARY_URL=                      # Fase 6
```

---

## 7. Despliegue — Fase 6

```
Frontend → Vercel (cookr.vercel.app)
Backend  → Render (https://{nombre-servicio}.onrender.com)
BD       → MongoDB Atlas M0
Redis    → Upstash (tier gratuito)
CI/CD    → GitHub Actions (push a main)
```

Ver `fase-0-pendientes.md` → SETUP-005, SETUP-006, SETUP-007

---

## 8. Commits — Conventional Commits

```
feat(auth): añadir endpoint POST /api/auth/registro
feat(home): implementar feed de recetas con skeleton loaders
feat(be): setup Express + estructura backend
fix(recetas): corregir scroll infinito en iOS Safari
docs(roadmap): actualizar modelo FE+BE paralelo
chore(deps): actualizar tanstack-query
```
