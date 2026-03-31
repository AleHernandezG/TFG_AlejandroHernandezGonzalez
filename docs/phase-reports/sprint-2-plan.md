# Sprint 2 — Plan
# Home + Feed + Detalle FE / Auth BE
# Fecha inicio: 2026-03-30 | Duración: 2 semanas

---

## Requisito previo FE — Stitch

ANTES de implementar cualquier vista FE de este sprint,
el autor debe crear y guardar en `docs/stitch/`:

```
docs/stitch/home/home.png + home.html                          → para TFG-20
docs/stitch/detalleReceta/detalleReceta.png + detalleReceta.html → para TFG-21
```

La NavBar (TFG-17) no requiere Stitch por ser un componente
de navegación global sin layout complejo.

---

## Frente FE — Nuevas vistas mock

### TFG-20 — Home / Feed de recetas
**Stitch requerido:** `docs/stitch/home/`

Criterios de aceptación:
- Cards con imagen, título, autor, likes, tiempo de preparación
- Skeleton loaders (mock con setTimeout)
- Scroll infinito mock
- Mobile-first: 1 columna mobile, 2 columnas tablet+
- Datos mock en `features/recetas/data/datosRecetas.ts`

Componentes a crear:
```
features/recetas/components/tarjetaReceta.tsx
features/recetas/components/feedRecetas.tsx
features/recetas/components/skeletonTarjeta.tsx
features/recetas/data/datosRecetas.ts
app/(main)/home/page.tsx
```

---

### TFG-17 — NavBar inferior
**Stitch requerido:** NO (componente global)

Criterios de aceptación:
- Visible en todas las páginas excepto `/` (landing)
- Iconos Lucide: `Home`, `Search`, `PlusCircle`, `Bell`, `User`
- Active state con color `brand`
- Mobile-first: `fixed bottom-0`, safe area insets

Componentes a crear:
```
components/common/navBarInferior.tsx
app/(main)/layout.tsx
```

---

### TFG-21 — Detalle de receta
**Stitch requerido:** `docs/stitch/detalleReceta/`

Criterios de aceptación:
- Imagen hero con gradiente superpuesto y nombre de la receta
- Tabs: Ingredientes | Pasos | Nutrición
- Botón "Me gusta" con animación optimista
- Botón "Guardar" con feedback visual
- Sección comentarios mock (3–4 comentarios estáticos)

Componentes a crear:
```
features/recetas/components/heroReceta.tsx
features/recetas/components/tabsReceta.tsx
features/recetas/components/comentariosReceta.tsx
app/(main)/recetas/[id]/page.tsx
```

---

## Frente BE — Auth real Sprint 1

### Setup inicial
- Proyecto Node + Express + TypeScript en `/backend`
- Estructura: `controllers/`, `models/`, `routes/`, `middlewares/`, `lib/`
- `.env`: `MONGODB_URI`, `JWT_SECRET`, `PORT=4000`
- CORS configurado para `localhost:3000`

### Modelos MongoDB
- `Usuario.model.ts` → ver [DOM-001](../changes/domain-changes.md)
- `Token.model.ts` → ver [DOM-002](../changes/domain-changes.md)
- Índice único en `usuarios.correo`
- TTL index en `tokens.expira`

### Endpoints a implementar

| Endpoint | Referencia | Prioridad |
|---|---|---|
| `POST /api/auth/registro` | API-004 | Alta |
| `POST /api/auth/login` | API-005 | Alta |
| `POST /api/auth/verificar-email` | API-006 | Media |
| `POST /api/auth/recuperar-contrasena` | API-007 | Media |
| `POST /api/auth/nueva-contrasena` | API-008 | Media |
| JWT Middleware | API-009 | Alta |

Ver detalles en [api-changes.md](../changes/api-changes.md).

---

## Orden de trabajo recomendado

1. Autor crea diseños en Stitch y los guarda en `docs/stitch/`
2. BE: setup Express + MongoDB + modelos Usuario + Token
3. FE: NavBar inferior (más rápido, sin Stitch)
4. FE: Home/Feed (adjuntar `docs/stitch/home/` al iniciar)
5. FE: Detalle de receta (adjuntar `docs/stitch/detalleReceta/`)
6. BE: endpoints auth uno a uno (registro → login → verificar → recuperar → nueva)
7. Lint + build limpios al cerrar el sprint

---

## Estado al cierre del sprint

| Tarea | Estado |
|---|---|
| TFG-20 — Home/Feed FE mock | ⏳ Pendiente |
| TFG-17 — NavBar inferior | ⏳ Pendiente |
| TFG-21 — Detalle de receta FE mock | ⏳ Pendiente |
| BE Setup Express + estructura | ⏳ Pendiente |
| DOM-001 Modelo Usuario | ⏳ Pendiente |
| DOM-002 Modelo Token | ⏳ Pendiente |
| API-004 POST /api/auth/registro | ⏳ Pendiente |
| API-005 POST /api/auth/login | ⏳ Pendiente |
| API-006 POST /api/auth/verificar-email | ⏳ Pendiente |
| API-007 POST /api/auth/recuperar-contrasena | ⏳ Pendiente |
| API-008 POST /api/auth/nueva-contrasena | ⏳ Pendiente |
| API-009 JWT Middleware | ⏳ Pendiente |
