# Auth Pages — Documentación Técnica

> **Última actualización:** 2026-04-21
> **Sprint:** Sprint 3 (rediseño visual) · Implementación inicial Sprint 1
> **Tareas Linear:** TFG-15 (registro) · TFG-16 (login)
> **Cambio visual:** [UI-022] — ver `docs/changes/ui-changes.md`

---

## Visión general

Las páginas `/login` y `/registro` son Server Components que actúan como shell de layout. Toda la lógica de formulario vive en Client Components dentro del feature `auth`. El layout es **imagen de fondo a pantalla completa** (mismo patrón que `SeccionHero`) con dos paneles flotantes: formulario y panel de marca.

---

## Árbol de componentes

```
app/login/page.tsx                  ← Server Component (metadata, layout shell)
│
├── <Image fill>                    ← fondo-auth.jpg a pantalla completa
├── <div> overlay bg-black/25       ← oscurecimiento mínimo
├── <main> Panel formulario (lg: w-1/2 derecha)
│   └── FormularioLogin             ← Client Component con Card propia
└── <div> Panel marca (lg: w-1/2 izquierda, hidden mobile)
    ├── Etiqueta "Red social gastronómica"
    ├── <h1> Cookr
    ├── Tagline
    └── <ul> 3 feature bullets

app/registro/page.tsx               ← mismo patrón, posiciones espejadas
│
├── <Image fill>
├── <div> overlay bg-black/25
├── <div> Panel marca (lg: w-1/2 izquierda, hidden mobile)
│   ├── Etiqueta
│   ├── <h1> Cookr
│   ├── Tagline
│   └── <ul> 3 feature bullets
└── <main> Panel formulario (lg: w-1/2 derecha)
    └── FormularioRegistro          ← Client Component con Card propia
```

---

## Layout

### Imagen de fondo

```tsx
<Image
  src="/images/fondo-auth.jpg"
  fill
  priority
  className="object-cover object-center"
/>
<div className="absolute inset-0 bg-black/25" />
```

- `fill` + `object-cover` cubre la pantalla completa, igual que el carrusel del hero
- Overlay `bg-black/25` mínimo — solo da profundidad sin ahogar la fotografía
- No hay gradientes laterales de fusión (eliminados en UI-022)

### Paneles

Ambas páginas usan `relative flex min-h-screen` como contenedor raíz. Los paneles son `relative z-10` y **no tienen fondo propio** — flotan sobre la imagen.

| Panel | `/login` | `/registro` |
|---|---|---|
| Formulario | `lg:w-1/2` izquierda | `lg:w-1/2` derecha |
| Marca | `lg:w-1/2` derecha | `lg:w-1/2` izquierda |
| Alineación contenido | `items-start pl-10 pr-8` | `items-end pl-8 pr-10` |

El contenido del panel de marca usa `items-start` / `items-end` (no `items-center`) para que quede pegado al centro de la pantalla (seam del split), patrón Clerk/Linear/Loom.

---

## Panel de marca — Detalle

### Etiqueta

```tsx
<div className="mb-5 flex items-center gap-2.5">
  <div className="h-px flex-1 bg-white/35" />
  <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white" style={{ textShadow }}>
    Red social gastronómica
  </span>
  <div className="h-px flex-1 bg-white/35" />
</div>
```

Las líneas `flex-1` a ambos lados crean el efecto centrado automáticamente sin `text-center` en el span.

### Marca "Cookr"

```tsx
<h1
  className="bg-gradient-to-br from-amber-100 to-amber-200 bg-clip-text font-black italic leading-none tracking-tight text-transparent"
  style={{
    fontSize: 'clamp(4rem, 5.5vw, 6.5rem)',
    filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.85)) drop-shadow(0 4px 36px rgba(0,0,0,0.55))',
  }}
>
  Cookr
</h1>
```

- `from-amber-100 to-amber-200`: crema muy claro arriba → beige dorado suave abajo
- Descartado `text-brand` sólido (naranja oscuro se fundía con la madera del fondo)
- Descartado `from-brand to-brand-muted bg-clip-text` (invisible sobre overlays oscuros — ver landingPage.md)
- Double `drop-shadow` para legibilidad sobre cualquier zona de la fotografía

### Textos generales

```ts
const textShadow = '0 1px 12px rgba(0,0,0,0.95), 0 2px 24px rgba(0,0,0,0.7)'
```

Doble capa de sombra: primera capa corta el borde de las letras (radio 12 px, casi opaco), segunda capa da profundidad (radio 24 px, menos opaco). Sin esta sombra los textos `text-white` desaparecen sobre zonas claras de la fotografía.

| Elemento | Clase | Peso |
|---|---|---|
| Etiqueta | `text-white` | `font-semibold` |
| Tagline | `text-white` | `font-medium` |
| Feature bullets | `text-white` | `font-semibold` |

### Feature bullets

```ts
const caracteristicas = [
  'Recetas personalizadas a tu gusto',
  'Comunidad gastronómica activa',
  'IA que aprende tus preferencias',
]
```

Lista simple `<ul>` sin iconos ni decoración. Los iconos (ChefHat, Users, Sparkles) se eliminaron en iteración final para dar limpieza visual.

---

## Formulario — Componentes

Los formularios tienen su propia `Card` de shadcn/ui y no dependen del fondo del panel para el contraste — son blancos/neutros sobre la imagen de fondo.

| Ruta | Componente | Ubicación |
|---|---|---|
| `/login` | `FormularioLogin` | `features/auth/components/formularioLogin.tsx` |
| `/registro` | `FormularioRegistro` | `features/auth/components/formularioRegistro.tsx` |

Ver `docs/phase-reports/fase-1-sprint-1-registro.md` para la arquitectura completa del feature auth.

---

## Assets

```
public/images/
└── fondo-auth.jpg    ← fotografía gastronómica compartida por /login y /registro
```

Imagen local — no requiere `remotePatterns` en `next.config.js`.

---

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Imagen fondo completo en lugar de split-screen | Mayor impacto visual; coherencia con el hero de la landing; el panel oscuro `--auth-dark` no aportaba valor con la imagen disponible |
| `bg-black/25` en lugar de `bg-black/30` + capas extra | La fotografía es más oscura que las imágenes del hero (madera vs. platos sobre fondo blanco); un overlay más ligero la preserva mejor |
| `items-end` / `items-start` en lugar de `items-center` | El contenido de marca pegado al centro de pantalla da sensación de diálogo con el formulario — patrón Clerk, Linear |
| `from-amber-100 to-amber-200` para "Cookr" | Beige/crema luminoso que contrasta con la madera sin saturación excesiva; `text-brand` (naranja) se fundía con los tonos cálidos del fondo |
| Double `textShadow` densa | La madera tiene zonas de luminosidad variable; una sola sombra fina no garantiza legibilidad en zonas claras |
| Sin iconos en feature bullets | Iconos añadían ruido visual y no aportaban información; el texto solo es más limpio y legible |
| 50/50 en lugar de 40/60 | Con el contenido expandido (tagline + bullets) la proporción igualitaria equilibra mejor el peso visual de cada panel |

---

## Pendientes relacionados

- [UI-008] Refactor capas FormularioRegistro → hook `useRegistro()` (Sprint 4)
- [UI-009] Refactor capas FormularioLogin → hook `useLogin()` (Sprint 4)
- Conectar formularios a backend real — `POST /api/usuarios/registro` y `POST /api/auth/login` (Fase 4)
