# Tech Debt — Cookr

**Última actualización:** 2026-04-09
**Registro unificado:** deuda de arquitectura de capas + infraestructura npm.
**Regla:** nunca editar una entrada resuelta. Si se resuelve, marcar ✅ y añadir fecha.
Adjunta este fichero cuando quieras resolver alguna entrada.

---

## Deuda de arquitectura — capas de abstracción FE

Todas las siguientes entradas violan el patrón obligatorio:
`FE: Componente → Hook → Service → apiClient → Backend`

Todas se resuelven en Sprint 4 cuando se cree `apiClient.ts` + `authService.ts` + `useAuth.ts`.

---

### [DEBT-001] FormularioRegistro — lógica de envío inline

**Estado:** ⏳ Pendiente — detectado en auditoría 2026-03-31
**Cuándo:** Antes de conectar el backend real (Fase 4)
**Fichero:** `src/features/auth/components/formularioRegistro.tsx`
**Violación:** `alEnviar` (líneas 76-97) directamente en el componente en lugar de en un hook

Qué hay que hacer:

1. Crear `src/services/apiClient.ts` — instancia Axios con interceptores JWT
2. Crear `src/services/authService.ts` con `authService.registro(datos)`
3. Crear `src/features/auth/hooks/useAuth.ts` con `useRegistro()`
4. Sustituir `alEnviar` por `const { registrar } = useAuth()`

**Impacto si no se corrige:** Al conectar el backend, la llamada Axios quedaría en el componente. Si cambia la URL o la librería HTTP, habría que modificar el componente.

---

### [DEBT-002] FormularioLogin — lógica de envío inline

**Estado:** ⏳ Pendiente — detectado en auditoría 2026-03-31
**Cuándo:** Antes de conectar el backend real (Fase 4)
**Fichero:** `src/features/auth/components/formularioLogin.tsx`
**Violación:** `alEnviar` (líneas 73-91) directamente en el componente

Qué hay que hacer:

1. En `authService.ts` añadir `authService.login(datos)`
2. En `useAuth.ts` añadir `useLogin()`
3. Sustituir `alEnviar` por `const { login } = useAuth()`

**Impacto si no se corrige:** Si el comportamiento post-login cambia (redirigir a /home en lugar de /) hay que buscar el componente en lugar de modificar el hook.

---

### [DEBT-003] FormularioRecuperarContrasena — lógica de envío inline

**Estado:** ⏳ Pendiente — detectado en auditoría 2026-03-31
**Cuándo:** Antes de conectar el backend real (Fase 4 / Fase 6)
**Fichero:** `src/features/auth/components/formularioRecuperarContrasena.tsx`
**Violación:** `alEnviar` (líneas 67-84) directamente en el componente

Qué hay que hacer:

1. En `authService.ts` añadir `authService.recuperarContrasena(correo)`
2. En `useAuth.ts` añadir `useRecuperarContrasena()`
3. Sustituir `alEnviar` por el hook

**Impacto si no se corrige:** La lógica de envío queda acoplada al componente, dificultando el reuso y los tests.

---

### [DEBT-004] FormularioNuevaContrasena — lógica de envío inline

**Estado:** ⏳ Pendiente — detectado en auditoría 2026-03-31
**Cuándo:** Antes de conectar el backend real (Fase 4 / Fase 6)
**Fichero:** `src/features/auth/components/formularioNuevaContrasena.tsx`
**Violación:** `alEnviar` (líneas 74-94) directamente en el componente

Qué hay que hacer:

1. En `authService.ts` añadir `authService.nuevaContrasena(token, contrasena)`
2. En `useAuth.ts` añadir `useNuevaContrasena()`
3. Sustituir `alEnviar` por el hook

**Impacto si no se corrige:** El token de recuperación y la lógica de cambio de contraseña quedan acoplados al componente visual.

---

### [DEBT-005] TarjetaVerificacionPendiente — lógica de reenvío inline

**Estado:** ⏳ Pendiente — detectado en auditoría 2026-03-31
**Cuándo:** Antes de conectar Resend (Fase 6)
**Fichero:** `src/features/auth/components/tarjetaVerificacionPendiente.tsx`
**Violación:** `handleReenviar` (líneas 42-49) directamente en el componente. Lógica de dominio mezclada con renderizado.

Qué hay que hacer:

1. En `authService.ts` añadir `authService.reenviarVerificacion(email)`
2. En `useAuth.ts` añadir `useReenviarVerificacion()`
3. Sustituir `handleReenviar` por el hook

**Impacto si no se corrige:** Si se cambia el proveedor de email (Resend por otro), hay que buscar el componente UI en lugar de tocar el service.

---

### [DEBT-006] TarjetaRecuperacionPendiente — lógica de reenvío inline

**Estado:** ⏳ Pendiente — detectado en auditoría 2026-03-31
**Cuándo:** Antes de conectar Resend (Fase 6)
**Fichero:** `src/features/auth/components/tarjetaRecuperacionPendiente.tsx`
**Violación:** `handleReenviar` (líneas 42-49) directamente en el componente.

Qué hay que hacer:

1. En `authService.ts` añadir `authService.reenviarRecuperacion(correo)`
2. En `useAuth.ts` añadir `useReenviarRecuperacion()`
3. Sustituir `handleReenviar` por el hook

**Impacto si no se corrige:** El cooldown de 60 s y la lógica de reintento quedan atados a la tarjeta visual.

---

### [DEBT-007] Flujo de registro — redirección a /completar-perfil post-auth

**Estado:** ⏳ Pendiente — detectado 2026-04-01
**Cuándo:** Al crear la vista /completar-perfil (alergias, gustos, dietas)
**Ficheros:**

- `src/features/auth/components/formularioRegistro.tsx`
- `src/features/auth/components/botonGoogle.tsx`
- `src/lib/auth.ts` (pages.newUser)
- Endpoint de verificación de email (backend)

Qué hay que hacer:

1. En `formularioRegistro.tsx` pasar `urlRetorno="/completar-perfil"` al `BotonGoogle` → registro con Google va directo a /completar-perfil
2. El endpoint de verificación de email debe redirigir a `/completar-perfil` en lugar de /home
3. En `/completar-perfil` comprobar desde el backend si el perfil ya está completo y redirigir a /home si es así — evita que usuarios ya registrados vuelvan a ver la vista

Flujo objetivo:

```text
Login                → /home
Registro sin Google  → /verificar-email/pendiente → /completar-perfil → /home
Registro con Google  → /completar-perfil → /home  (skip verificación)
```

**Impacto si no se corrige:** Un usuario ya registrado con Google que pulse "Registrarse con Google" volvería a ver la vista de completar perfil.

---

## Deuda de infraestructura — paquetes npm

---

### [DEBT-008] Paquetes deprecated en npm install

**Estado:** ⏳ Aplazado — registrado 2026-03-21
**Cuándo:** Fase 6 (deploy) o al actualizar Next.js a v15

Al ejecutar `npm install` en `/frontend` aparecen ~15 warnings de deprecated. No bloquean desarrollo, lint, build ni tests. Son solo informativos.

**Tres categorías:**

**Categoría A — Transitivas (no controlables):**
`inflight`, `rimraf@2/3`, `glob@7/10`, `rollup-plugin-terser`, `sourcemap-codec`, `source-map`, `node-domexception`, `@humanwhocodes/*`
Son dependencias de nuestras dependencias. No hay acción directa posible. Ignorar.

**Categoría B — eslint@8 (bloqueado por framework):**
`eslint@8.57.1` está fijado por `eslint-config-next@14.2.35`, que solo soporta ESLint v8. Pasar a ESLint v9 requiere migrar Next.js 14 → 15 y cambiar a flat config. No compensa el riesgo en Fases 1-5.

**Categoría C — next-pwa@5.6.0 (deprecado pero funcional):**
Warnings de Workbox Google Analytics (que el proyecto no usa). Funciona correctamente. El sucesor es `@ducanh2912/next-pwa`.

**Cómo resolver en Fase 6:**

`[DEBT-008-A]` eslint@8 → eslint@9:

```bash
cd frontend
npm install next@15 eslint@9 eslint-config-next@15
# Migrar .eslintrc.json → eslint.config.js (flat config)
npm run lint
```

`[DEBT-008-B]` next-pwa@5 → @ducanh2912/next-pwa:

```bash
npm uninstall next-pwa
npm install @ducanh2912/next-pwa
# Actualizar next.config.js: withPWA = require('@ducanh2912/next-pwa').default({ ... })
```

`[DEBT-008-C]` Transitivas: se resolverán solas al actualizar Next.js / eslint. No requieren acción directa.
