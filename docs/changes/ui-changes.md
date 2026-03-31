# UI Changes — Cookr

Registro de cambios visuales y de componentes. Formato: [UI-XXX] por orden cronológico.

> **Regla de oro:** nunca editar una entrada completada. Si el cambio evoluciona, crear una nueva entrada.

---

## [UI-014] — Comportamiento scroll en Home: header y buscador no sticky
Fecha: 2026-04-01 | Estado: 👁️ Pendiente revisión | Sprint: 2

Decisión del autor: tanto `HeaderHome` como `BuscadorFiltros` desaparecen al hacer scroll,
sin quedarse anclados en pantalla.

Ficheros modificados:
- `features/recetas/components/headerHome.tsx` — eliminado `sticky top-0 z-40`; también
  eliminada la campana (Bell) y centrado el título "Cookr" (`justify-center`)
- `components/common/buscadorFiltros.tsx` — eliminado `sticky z-30` del contenedor base
- `features/recetas/components/feedHome.tsx` — eliminado `className="top-0"` del prop
  `BuscadorFiltros` (ya no es necesario)

Motivo: preferencia visual del autor — la pantalla completa es para el feed de recetas.

---

## [UI-001] — Layout split-screen /registro ✅

**Fecha:** 2026-03-21
**Fichero:** `frontend/src/app/registro/page.tsx`

Layout de dos paneles para la ruta `/registro`:

- Panel izquierdo (lg+): imagen gastronómica `fondo-auth.jpg` con `overlay bg-black/30` + gradiente lateral `from-transparent to-[var(--auth-dark)]` que funde imagen y panel sin corte brusco
- Texto editorial: `h1 font-black italic` + etiqueta decorativa con líneas horizontales + subtítulo `uppercase tracking-[0.35em]`
- Panel derecho: `bg-[var(--auth-dark)]` — negro cálido; Card blanca flota con contraste elegante
- Móvil: imagen oculta, formulario a pantalla completa con fondo oscuro

---

## [UI-002] — Paleta de colores Cookr completa ✅

**Fecha:** 2026-03-23
**Ficheros:** `frontend/src/app/globals.css`, `datosLanding.ts`, `bentoCaracteristicas.tsx`, `tarjetaTestimonio.tsx`, `formularioRegistro.tsx`, `registro/page.tsx`

Refactorización en dos pasadas para eliminar todos los colores hardcodeados:

**Pasada 1** — colores Tailwind genéricos sustituidos por vars existentes (`--brand`, `--brand-muted`, `--hero-gradient-*`, `--destructive`, `--chart-3`).

**Pasada 2** — nuevas variables CSS añadidas a `globals.css` (`:root` y `.dark`):

- `--category-social` → azul para elementos de comunidad
- `--category-ai` → violeta para elementos de IA
- `--theme-fresh` → verde para carrusel ensaladas
- `--theme-sweet` → rosa para carrusel postres
- `--theme-pasta` → violeta para carrusel pastas
- `--auth-dark` → negro cálido para panel de autenticación

Excepciones documentadas: `bg-black/30` (overlay funcional) y Google SVG fills (colores corporativos obligatorios).

---

## [UI-003] — Páginas legales /privacidad y /terminos ✅

**Fecha:** 2026-03-23
**Ficheros:** `frontend/src/app/privacidad/page.tsx`, `frontend/src/app/terminos/page.tsx`

**Política de privacidad** (`/privacidad`) — 10 secciones RGPD:

- Responsable del tratamiento (aviso académico TFG)
- Datos recogidos, tabla de finalidades con base legal
- Servicios de terceros: Google OAuth, Gemini, Edamam, Cloudinary, Resend, MongoDB Atlas, Vercel
- Retención, derechos RGPD, seguridad, menores (mín. 14 años)

**Términos de uso** (`/terminos`) — 11 secciones:

- Descripción completa del servicio (recetas, despensa, Gemini IA, Edamam, grupos, Modo Manos Libres, PWA)
- Tabla uso aceptable (✅ permitido / 🚫 prohibido)
- Aviso legal IA (respuestas orientativas, no consejo médico)

Diseño: cabecera sticky con logo Cookr + botón volver, índice navegable con anclas `#id`, 100% paleta Cookr.

---

## [UI-005] — Flujo de verificación de email (mock) ✅

**Fecha:** 2026-03-23
**Ficheros:** `frontend/src/app/verificar-email/pendiente/page.tsx`, `frontend/src/app/verificar-email/page.tsx`, `frontend/src/features/auth/components/tarjetaVerificacionPendiente.tsx`, `frontend/src/features/auth/components/formularioRegistro.tsx`

Pantallas del flujo de verificación de email post-registro. Todo es mock hasta Fase 4-6.

**`/verificar-email/pendiente`** — Pantalla "revisa tu correo":
- Icono de sobre con fondo `--brand-subtle`
- Muestra el email pasado como `?email=` desde `formularioRegistro.tsx`
- Aviso de carpeta spam
- Botón "Reenviar correo" con cooldown de 60 s (mock, TODO [AUTH-005] Fase 6: Resend)
- Link "Volver al registro"

**`/verificar-email`** — Verificación de token:
- Lee `?token=` de la query string
- Estado `verificando` → spinner + texto
- Si hay token: éxito tras 1.5 s (mock) → CheckCircle2 + botón a `/login`
- Si no hay token: error inmediato → XCircle + botones a `/registro` y reenvío
- TODO [AUTH-006] Fase 4: POST /api/auth/verificar-email con validación real del JWT

**`formularioRegistro.tsx`** — Modificación:
- Al hacer submit con éxito, `router.push('/verificar-email/pendiente?email=...')` en lugar del inline success card
- Eliminada la vista de éxito inline (reemplazada por la página dedicada)

0 colores hardcodeados — usa `--brand-subtle`, `--chart-3`, `text-brand`, `text-destructive`.

---

## [UI-008] Refactor capas — FormularioRegistro
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4
Fichero: `src/features/auth/components/formularioRegistro.tsx`

Cambio:
  Extraer `alEnviar` a hook `useRegistro()` en `useAuth.ts`.
  El componente solo llama al hook: `const { registrar, estado } = useAuth()`.

Archivos afectados:
  `src/services/apiClient.ts` → CREAR (instancia Axios con JWT)
  `src/services/authService.ts` → CREAR (método `registro`)
  `src/features/auth/hooks/useAuth.ts` → CREAR (hook `useRegistro`)
  `src/features/auth/components/formularioRegistro.tsx` → MODIFICAR

Motivo: cumplir patrón FE: Componente → Hook → Service → apiClient.
        Ver [DEBT-001](../tech-debt.md)

---

## [UI-009] Refactor capas — FormularioLogin
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4
Fichero: `src/features/auth/components/formularioLogin.tsx`

Cambio:
  Extraer `alEnviar` a hook `useLogin()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `login`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR (añadir `useLogin`)
  `src/features/auth/components/formularioLogin.tsx` → MODIFICAR

Motivo: ver [DEBT-002](../tech-debt.md)

---

## [UI-010] Refactor capas — FormularioRecuperarContrasena
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/formularioRecuperarContrasena.tsx`

Cambio:
  Extraer `alEnviar` a hook `useRecuperarContrasena()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `recuperarContrasena`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/formularioRecuperarContrasena.tsx` → MODIFICAR

Motivo: ver [DEBT-003](../tech-debt.md)

---

## [UI-011] Refactor capas — FormularioNuevaContrasena
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/formularioNuevaContrasena.tsx`

Cambio:
  Extraer `alEnviar` a hook `useNuevaContrasena()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `nuevaContrasena`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/formularioNuevaContrasena.tsx` → MODIFICAR

Motivo: ver [DEBT-004](../tech-debt.md)

---

## [UI-012] Refactor capas — TarjetaVerificacionPendiente
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/tarjetaVerificacionPendiente.tsx`

Cambio:
  Extraer `handleReenviar` a hook `useReenviarVerificacion()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `reenviarVerificacion`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/tarjetaVerificacionPendiente.tsx` → MODIFICAR

Motivo: ver [DEBT-005](../tech-debt.md)

---

## [UI-013] Refactor capas — TarjetaRecuperacionPendiente
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/tarjetaRecuperacionPendiente.tsx`

Cambio:
  Extraer `handleReenviar` a hook `useReenviarRecuperacion()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `reenviarRecuperacion`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/tarjetaRecuperacionPendiente.tsx` → MODIFICAR

Motivo: ver [DEBT-006](../tech-debt.md)

---

## [UI-004] — Tipografía creativa en SeccionHero ✅

**Fecha:** 2026-03-23
**Fichero:** `frontend/src/features/landing/components/seccionHero.tsx`

Patrones tipográficos creativos aplicados al titular y subtítulo de la hero section, inspirados en Linear, Framer, Notion y Spotify:

**H1 — tres tratamientos por palabra clave:**

| Palabra     | Técnica CSS                                                                | Referente            |
| ----------- | -------------------------------------------------------------------------- | -------------------- |
| `cocinando` | `font-black italic text-brand`                                             | Spotify, Bon Appétit |
| `recetas`   | SVG wavy `var(--brand)`, `preserveAspectRatio="none"`                      | Notion, Framer, Arc  |
| `Cookr`     | `bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-transparent` | Linear, Stripe       |

El SVG wavy usa la curva cuadrática `M0,5 Q25,1 50,5 Q75,9 100,5` con `overflow-visible` para no recortarse fuera del bounding box del texto.

**Subtítulo:** `comparte tus recetas` en `font-semibold text-foreground/80` para contrastar dentro del párrafo muted.

0 colores hardcodeados — toda la paleta usa variables Cookr del sistema de diseño.
