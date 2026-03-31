# Tech Debt — Cookr

Registro de deuda técnica detectada en auditorías de capas de abstracción.
Formato: [DEBT-XXX] por orden de detección.

> **Regla:** nunca editar una entrada resuelta. Si se resuelve, marcar ✅ y añadir fecha.

---

## [DEBT-001] FormularioRegistro — lógica de envío inline

Estado:   ⏳ Pendiente — detectado en auditoría 2026-03-31
Cuándo:   Antes de conectar el backend real (Fase 4)
Fichero:  `src/features/auth/components/formularioRegistro.tsx`
Violación: Capa E — `alEnviar` (líneas 76-97) está directamente en el componente
            en lugar de en un hook de abstracción

Qué hay que hacer:
  1. Crear `src/services/apiClient.ts` — instancia Axios con interceptores JWT
  2. Crear `src/services/authService.ts` con `authService.registro(datos)`
  3. Crear `src/features/auth/hooks/useAuth.ts` con `useRegistro()`
  4. Sustituir `alEnviar` en el componente por `const { registrar } = useAuth()`

Impacto si no se corrige:
  Al conectar el backend en Fase 4, la llamada Axios quedaría directamente
  en el componente, violando FE: Componente → Hook → Service → apiClient.
  Si cambia la URL o la librería HTTP, habría que modificar el componente.

---

## [DEBT-002] FormularioLogin — lógica de envío inline

Estado:   ⏳ Pendiente — detectado en auditoría 2026-03-31
Cuándo:   Antes de conectar el backend real (Fase 4)
Fichero:  `src/features/auth/components/formularioLogin.tsx`
Violación: Capa E — `alEnviar` (líneas 73-91) directamente en el componente

Qué hay que hacer:
  1. En `src/services/authService.ts` añadir `authService.login(datos)`
  2. En `src/features/auth/hooks/useAuth.ts` añadir `useLogin()`
  3. Sustituir `alEnviar` en el componente por `const { login } = useAuth()`

Impacto si no se corrige:
  Mismo que DEBT-001. Además, si el comportamiento post-login cambia
  (redirigir a /feed en lugar de /) hay que buscar el componente en lugar
  de modificar únicamente el hook.

---

## [DEBT-003] FormularioRecuperarContrasena — lógica de envío inline

Estado:   ⏳ Pendiente — detectado en auditoría 2026-03-31
Cuándo:   Antes de conectar el backend real (Fase 4 / Fase 6)
Fichero:  `src/features/auth/components/formularioRecuperarContrasena.tsx`
Violación: Capa E — `alEnviar` (líneas 67-84) directamente en el componente

Qué hay que hacer:
  1. En `src/services/authService.ts` añadir `authService.recuperarContrasena(correo)`
  2. En `src/features/auth/hooks/useAuth.ts` añadir `useRecuperarContrasena()`
  3. Sustituir `alEnviar` en el componente por el hook

Impacto si no se corrige:
  La lógica de envío del email de recuperación queda acoplada al componente,
  dificultando el reuso y los tests.

---

## [DEBT-004] FormularioNuevaContrasena — lógica de envío inline

Estado:   ⏳ Pendiente — detectado en auditoría 2026-03-31
Cuándo:   Antes de conectar el backend real (Fase 4 / Fase 6)
Fichero:  `src/features/auth/components/formularioNuevaContrasena.tsx`
Violación: Capa E — `alEnviar` (líneas 74-94) directamente en el componente

Qué hay que hacer:
  1. En `src/services/authService.ts` añadir `authService.nuevaContrasena(token, contrasena)`
  2. En `src/features/auth/hooks/useAuth.ts` añadir `useNuevaContrasena()`
  3. Sustituir `alEnviar` en el componente por el hook

Impacto si no se corrige:
  El token de recuperación y la lógica de cambio de contraseña quedan
  acoplados al componente visual.

---

## [DEBT-005] TarjetaVerificacionPendiente — lógica de reenvío inline

Estado:   ⏳ Pendiente — detectado en auditoría 2026-03-31
Cuándo:   Antes de conectar Resend (Fase 6)
Fichero:  `src/features/auth/components/tarjetaVerificacionPendiente.tsx`
Violación: Capa C+E — `handleReenviar` (líneas 42-49) directamente en el componente.
            Lógica de dominio (reenvío de email de verificación) mezclada con renderizado.

Qué hay que hacer:
  1. En `src/services/authService.ts` añadir `authService.reenviarVerificacion(email)`
  2. En `src/features/auth/hooks/useAuth.ts` añadir `useReenviarVerificacion()`
  3. Sustituir `handleReenviar` en el componente por el hook

Impacto si no se corrige:
  Si se cambia el proveedor de email (Resend por otro), hay que buscar
  el componente UI en lugar de tocar únicamente el service.

---

## [DEBT-006] TarjetaRecuperacionPendiente — lógica de reenvío inline

Estado:   ⏳ Pendiente — detectado en auditoría 2026-03-31
Cuándo:   Antes de conectar Resend (Fase 6)
Fichero:  `src/features/auth/components/tarjetaRecuperacionPendiente.tsx`
Violación: Capa C+E — `handleReenviar` (líneas 42-49) directamente en el componente.
            Lógica de reenvío del correo de recuperación mezclada con renderizado.

Qué hay que hacer:
  1. En `src/services/authService.ts` añadir `authService.reenviarRecuperacion(correo)`
  2. En `src/features/auth/hooks/useAuth.ts` añadir `useReenviarRecuperacion()`
  3. Sustituir `handleReenviar` en el componente por el hook

Impacto si no se corrige:
  Mismos problemas que DEBT-005. El cooldown de 60 s y la lógica de
  reintento quedan atados a la tarjeta visual.
