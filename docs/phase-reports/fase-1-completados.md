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

## [AUTH-001] Cambiar callbackUrl en BotonGoogle de "/" a "/feed"

Estado: ⏳ Pendiente — aplazado a Fase 2
Cuándo: Fase 2 — cuando exista la ruta /feed

Qué hay que hacer:
En `src/features/auth/components/botonGoogle.tsx`:

- Cambiar el valor por defecto del prop urlRetorno de "/" a "/feed"
- También cambiar la llamada en formularioRegistro.tsx y formularioLogin.tsx si pasan urlRetorno
  explícitamente (si usan el valor por defecto, basta con cambiar el componente)

Nota: la ruta /feed no existe hasta Fase 2. Si se cambia antes creará un 404 al autenticarse.

---

## [AUTH-002] Conectar formularioRegistro con backend

Estado: ⏳ Pendiente — aplazado a Fase 4
Cuándo: Fase 4 — cuando el backend esté implementado

Qué hay que hacer:
En `src/features/auth/components/formularioRegistro.tsx` (función alEnviar):

- Sustituir el mock (setTimeout + setEstadoEnvio("exito")) por:
  await axios.post("/api/usuarios/registro", datos)
- Manejar errores de red (409 correo ya existe, 422 validación backend, 500 error servidor)
- Mostrar mensaje de error específico en el banner rojo según el código de respuesta

---

## [AUTH-003] Añadir CredentialsProvider a NextAuth

Estado: ⏳ Pendiente — aplazado a Fase 4
Cuándo: Fase 4 — cuando el backend esté implementado

Qué hay que hacer:
En `src/lib/auth.ts`:

- Importar CredentialsProvider de "next-auth/providers/credentials"
- Añadir al array providers junto a GoogleProvider
- authorize() debe llamar al backend: POST /api/auth/login con email y password
- Devolver null si las credenciales son inválidas (NextAuth mostrará error de login)
- Devolver el objeto usuario si las credenciales son válidas

---

## [AUTH-005] Proteger rutas autenticadas con getServerSession + redirect

Estado: ⏳ Pendiente — aplazado a Fase 2
Cuándo: Fase 2 — cuando exista la ruta /feed y otras rutas protegidas

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

Estado: ⏳ Pendiente (funciona con fondo y emojis temporalmente)
Cuándo: Sprint 2 o cuando se integren assets reales (Fase 2 / Frontend UI)

Qué hay que hacer:

1. Sustituir los placeholders de colores/emojis (`gradient`, `emoji`) en `heroSlides` de `src/features/landing/data/landing-data.ts` por URLs de imágenes reales o conectarlo a una API / CDN.
2. Implementar un componente `Image` de `next/image` en `src/features/landing/components/hero-section.tsx` dentro del bucle del carrusel, con propiedades `fill`, `objectFit="cover"`, `priority` (para la primera imagen) para optimización SEO y LCP.
3. Asegurarse de que las transiciones de opacidad (fade) de Framer Motion o CSS sigan funcionando correctamente con las imágenes.
4. Revisar la accesibilidad (alt text) de las imágenes.

Commit esperado:
feat(landing): implementar imágenes reales en carrusel de hero section
