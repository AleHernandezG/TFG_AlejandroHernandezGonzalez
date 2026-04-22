# Fase 1 — Tareas Pendientes para Retomar

# TFG · Red Social Gastronómica con IA

# Creado: 2026-03-20 | Actualizado: 2026-03-30 (sesión 5) | Estado: ✅ Completada

#

# Adjunta este fichero a Claude cuando quieras completar estas tareas.

# Contexto: "Quiero completar las tareas pendientes de la Fase 1"

# ─────────────────────────────────────────────────────────────────────

## [TFG-16] Login (/login)

Estado: ✅ Aprobado por autor — 2026-03-30

Qué se hizo:
- `src/app/login/page.tsx` — layout split-screen espejado (form izquierda, imagen derecha)
- `src/features/auth/components/formularioLogin.tsx` — 2 campos, toggle contraseña, enlace "¿Olvidaste tu contraseña?", mock submit
- `esquemaLogin` + `DatosLogin` añadidos a `autenticacion.ts`
- Barrel export actualizado
- Documentación técnica: `docs/iniciar.html` (10 secciones)

---

## [UI-007] Flujo de recuperación de contraseña (3 vistas)

Estado: ✅ Aprobado por autor — 2026-03-30

Qué se hizo:
- `src/app/recuperar-contrasena/page.tsx` — layout igual que /login (form izq, imagen der), solo campo email
- `src/app/recuperar-contrasena/pendiente/page.tsx` — pantalla "revisa tu correo" con cooldown reenvío 60s
- `src/app/nueva-contrasena/page.tsx` — layout como /registro (imagen izq, form der), 2 campos + éxito in-page
- Componentes: `FormularioRecuperarContrasena`, `TarjetaRecuperacionPendiente`, `FormularioNuevaContrasena`
- Tipos Zod: `esquemaRecuperarContrasena`, `esquemaNuevaContrasena` en `autenticacion.ts`
- TODOs marcados: `[AUTH-008]` (Fase 6) y `[AUTH-009]` (Fase 4+6)

---

## [AUTH-001] Cambiar callbackUrl en BotonGoogle de "/" a "/home"

Estado: ✅ Completado — Sprint 2
Cuándo: Sprint 2 — al implementar /home como ruta principal post-login

Qué se hizo:

- `urlRetorno` en `botonGoogle.tsx` ya apuntaba a `/home` al revisar. Comentario JSDoc actualizado para reflejar el valor real.
- La ruta /home existe desde Sprint 2 FE.

---

## [AUTH-002] Conectar formularioRegistro con backend

Estado: ✅ Completado — Sprint 2 FE
Cuándo: Sprint 2 FE — backend implementado en Sprint 2 BE

Qué se hizo:

- `formularioRegistro.tsx` conectado a `authService.registro()` → `POST /api/auth/registro`
- Manejo de error 409 (correo ya registrado) con mensaje en banner rojo
- `authService.ts` creado en `frontend/src/services/authService.ts` (API-011)

---

## [AUTH-003] Añadir CredentialsProvider a NextAuth

Estado: ✅ Completado — Sprint 2 FE
Cuándo: Sprint 2 FE — backend de login implementado en Sprint 2 BE

Qué se hizo:

- `CredentialsProvider` añadido a `src/lib/auth.ts` junto a `GoogleProvider`
- `authorize()` llama a `POST /api/auth/login`; maneja 401 (credenciales inválidas) y 403 (cuenta no verificada)
- `formularioLogin.tsx` usa `signIn("credentials")` de NextAuth

---

## [AUTH-005] Proteger rutas autenticadas con getServerSession + redirect

Estado: ⏳ Aplazado — Fase 6 (antes del deploy)
Cuándo: Fase 6 — aplazado intencionalmente durante desarrollo para no requerir auth al revisar vistas

Qué hay que hacer:

Crear un grupo de rutas protegidas en App Router y añadir un layout que verifique la sesión:

1. Crear la carpeta `src/app/(autenticado)/layout.tsx`
2. Dentro del layout llamar a `getServerSession(opcionesAuth)`
3. Si no hay sesión → `redirect("/login")`
4. Si hay sesión → renderizar `{children}`

```tsx
// src/app/(autenticado)/layout.tsx
import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LayoutAutenticado({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(opcionesAuth);
  if (!session) redirect("/login");
  return <>{children}</>;
}
```

5. Mover `/feed` y cualquier otra ruta que requiera login dentro de `(autenticado)/`

Nota: NextAuth instala y lee la cookie JWT automáticamente, pero NO redirige por sí solo.
La protección de rutas debe implementarse explícitamente en el layout del grupo.

---

## [AUTH-004] Enriquecer callback session con datos del backend

Estado: ⏳ Pendiente — aplazado a Fase 4
Cuándo: Fase 4 — cuando el backend esté implementado

Qué hay que hacer:
En `src/lib/auth.ts` (callback session):

- Además del id (token.sub), añadir: avatar, nombre, rol
- Ampliar el tipo de session.user para incluir estos campos
- Estos datos vendrán del backend al autenticarse (tanto Google como Credentials)

---

## [UI-001] Imagen de fondo para páginas de autenticación (/registro y /login)

Estado: ✅ Parcialmente completado — /registro ✅ | /login ⏳ (pendiente TFG-16)
Cuándo: Sprint 1

Qué se hizo:
- Imagen colocada en `frontend/public/images/fondo-auth.jpg` (2843×4264 px, 3 MB)
- `src/app/registro/page.tsx` — layout split-screen definitivo:
  - Panel izquierdo (lg+): imagen con overlay `bg-black/30` + gradiente lateral `from-transparent to-stone-950`
  - Texto editorial centrado: h1 `font-black italic` (clamp 2.8–4.5rem) + líneas decorativas + subtítulo uppercase
  - Panel derecho: `bg-gradient-to-b from-stone-950 to-zinc-950`
  - next/image optimiza automáticamente (sirve WebP al tamaño exacto de cada pantalla)

Pendiente:
- Aplicar el mismo tratamiento a `src/app/login/page.tsx` al implementar TFG-16

Nota sobre el tamaño de la imagen:
  La imagen fuente de 3 MB no se sirve tal cual — next/image genera versiones optimizadas
  en WebP al tamaño exacto de cada dispositivo. No es necesario redimensionar.
  Si se quisiese aligerar el repo: tamaño ideal 1280×1920 px a ≤ 300 KB.

Commit esperado:
feat(auth): añadir imagen de fondo gastronómica a páginas registro y login

---

## [LANDING-001] Configuración Real del Carrusel de Imágenes

Estado: ✅ Completado — Sprint 3
Cuándo: Sprint 3 — implementado junto a CAROUSEL-001/002/003

Qué se hizo:

- 4 fotografías WebP reales en `public/images/hero/` (desayuno, ensalada, postre, pasta)
- `imageUrl: string` añadido a la interfaz `SlideHero` en `datosLanding.ts`; campo `emoji` eliminado
- `next/image fill` con `sizes="100vw"` y `priority` en el primer slide
- Transición T1 Crossfade (fundido opacidad, patrón Airbnb/Apple) — `AnimatePresence mode="popLayout"`, duration 1.2 s
- `aria-live="polite"` + `aria-label` en puntos indicadores (CAROUSEL-003)

Ver: `docs/phase-reports/fase-1-sprint-1-carrousel-completados.md`
