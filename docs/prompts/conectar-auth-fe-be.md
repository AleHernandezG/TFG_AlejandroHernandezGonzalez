# Tarea: Conectar Auth FE → BE real

> **Documento de contexto para Claude Code.**
> Contiene todo lo necesario para ejecutar la tarea sin leer ficheros adicionales.
> Al terminar, actualiza `docs/context.md` según las instrucciones del final.

---

## 1. Contexto del proyecto

**App:** Cookr — red social gastronómica (TFG).
**Stack FE:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · NextAuth · React Hook Form · Zod · Framer Motion.
**Stack BE:** Node.js · Express · TypeScript · Mongoose · Zod · JWT (jsonwebtoken) · bcryptjs.
**Sprint actual:** Sprint 2 — el BE de auth ya está operativo. El FE sigue con mocks.

### Arquitectura de capas (OBLIGATORIA)

```
FE: Componente → Hook → Service → apiClient → Backend
BE: Route → Controller → Service → Repository → MongoDB
```

Reglas absolutas:
- Ningún componente llama a Axios directamente.
- Ningún hook conoce URLs de la API (`/api/auth/...`).
- Nuevas llamadas HTTP → `frontend/src/services/<nombre>Service.ts`.

### Paleta de colores

Usar siempre variables CSS de `globals.css`. Nunca colores Tailwind genéricos.
Correcto: `bg-brand`, `text-muted-foreground`, `border-destructive/30`
Incorrecto: `bg-orange-500`, `text-gray-400`

---

## 2. Estado actual del backend

### Endpoints disponibles

`backend/src/app.ts` — servidor Express en puerto 4000, CORS para `FRONTEND_URL` (default `http://localhost:3000`).

`backend/src/routes/auth.routes.ts`:
```
POST /api/auth/registro             → authController.registro
POST /api/auth/login                → authController.login
POST /api/auth/verificar-email      → authController.verificarEmail
POST /api/auth/recuperar-contrasena → authController.recuperarContrasena
POST /api/auth/nueva-contrasena     → authController.nuevaContrasena
```

Todos los endpoints pasan por `validarBody(esquema)` antes del controller.

### Contratos de la API (request / response)

**POST /api/auth/registro**
- Request: `{ nombre: string, correo: string, contrasena: string }`
- Response 201: `{ mensaje: "Registro completado. Revisa tu correo para verificar la cuenta." }`
- Response 409: `{ error: "Este correo ya está registrado" }`

**POST /api/auth/login**
- Request: `{ correo: string, contrasena: string }`
- Response 200: `{ token: string, usuario: { id, nombre, correo, foto, rol } }`
- Response 401: `{ error: "Credenciales incorrectas" }`
- Response 403: `{ error: "Debes verificar tu correo antes de iniciar sesión" }`

**POST /api/auth/verificar-email**
- Request: `{ token: string }`
- Response 200: `{ mensaje: "Email verificado correctamente. Ya puedes iniciar sesión." }`
- Response 400: `{ error: "Token de verificación inválido o expirado" }`

**POST /api/auth/recuperar-contrasena**
- Request: `{ correo: string }`
- Response 200: `{ mensaje: "Si existe una cuenta con ese correo, recibirás un enlace de recuperación." }` (siempre, nunca revela si existe)

**POST /api/auth/nueva-contrasena**
- Request: `{ token: string, contrasena: string }`
- Response 200: `{ mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." }`
- Response 400: `{ error: "Token de recuperación inválido o expirado" }`

### JWT del backend

`backend/src/lib/jwt.ts`:
```ts
// El token firmado contiene: { id: string, correo: string, rol: string }
// Expira en 7d por defecto
// Secreto: process.env.JWT_SECRET
```

### Validadores Zod del backend

`backend/src/lib/validadores.ts`:
```ts
esquemaRegistro  → { nombre (min 2), correo (email), contrasena (min 8, letra+número) }
esquemaLogin     → { correo (email), contrasena (min 1) }
esquemaRecuperar → { correo (email) }
esquemaNuevaContrasena → { token (min 1), contrasena (min 8, letra+número) }
esquemaVerificarEmail  → { token (min 1) }
```

### Limitación conocida

El BE crea tokens de verificación y recuperación en MongoDB pero **no envía emails** (Resend es Fase 6). Implicación:
- Registro: funciona (usuario creado en DB).
- Login con credenciales: devuelve 403 hasta que la cuenta esté verificada. Para pruebas locales, poner `cuentaVerificada: true` manualmente en MongoDB Atlas.
- Recuperar/NuevaContraseña: el token se guarda en DB pero no llega por email.
- VerificarEmail: lo mismo.

---

## 3. Estado actual del frontend (ficheros relevantes)

### `frontend/src/lib/auth.ts` (ACTUAL — solo Google)

```ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const opcionesAuth: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/registro",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
};
```

### `frontend/src/features/auth/types/autenticacion.ts` (ACTUAL)

```ts
import { z } from "zod";

export const esquemaRegistro = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "...").trim(),
  correo: z.string().email("Introduce un correo electrónico válido").trim(),
  contrasena: z.string().min(8, "...").regex(/[A-Za-z]/, "...").regex(/[0-9]/, "..."),
  confirmarContrasena: z.string(),
}).refine((d) => d.contrasena === d.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"],
});
export type DatosRegistro = z.infer<typeof esquemaRegistro>;

export const esquemaRecuperarContrasena = z.object({
  correo: z.string().email("Introduce un correo electrónico válido").trim(),
});
export type DatosRecuperarContrasena = z.infer<typeof esquemaRecuperarContrasena>;

export const esquemaNuevaContrasena = z.object({
  contrasena: z.string().min(8, "...").regex(/[A-Za-z]/, "...").regex(/[0-9]/, "..."),
  confirmarContrasena: z.string(),
}).refine((d) => d.contrasena === d.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"],
});
export type DatosNuevaContrasena = z.infer<typeof esquemaNuevaContrasena>;

export const esquemaLogin = z.object({
  correo: z.string().email("Introduce un correo electrónico válido").trim(),
  contrasena: z.string().min(1, "Introduce tu contraseña"),
});
export type DatosLogin = z.infer<typeof esquemaLogin>;

export type EstadoFormulario = "idle" | "cargando" | "exito" | "error";
```

### Mocks que hay que sustituir

**`formularioRegistro.tsx` — función `alEnviar` (mock actual):**
```ts
// TODO Fase 4: sustituir por llamada real a POST /api/auth/registro
await new Promise((r) => setTimeout(r, 1000)); // simula latencia
router.push(`/verificar-email/pendiente?email=${encodeURIComponent(datos.correo)}`);
```

**`formularioLogin.tsx` — función `alEnviar` (mock actual):**
```ts
// TODO [AUTH-007] Fase 4: sustituir por signIn("credentials", ...)
await new Promise((r) => setTimeout(r, 1000));
router.push("/home");
```

**`formularioRecuperarContrasena.tsx` — función `alEnviar` (mock actual):**
```ts
// TODO [AUTH-008] Fase 6: llamar a POST /api/auth/recuperar-contrasena
await new Promise((r) => setTimeout(r, 1000));
router.push(`/recuperar-contrasena/pendiente?email=${encodeURIComponent(datos.correo)}`);
```

**`formularioNuevaContrasena.tsx` — función `alEnviar` (mock actual):**
```ts
// Recibe `token: string` como prop pero lo ignora completamente
// TODO [AUTH-009] Fase 4+6: llamar a POST /api/auth/nueva-contrasena
await new Promise((r) => setTimeout(r, 1000));
setEstadoEnvio("exito");
```

### Servicios — no existen aún

`frontend/src/services/` → **carpeta vacía** (no existe ningún fichero). Hay que crearla.

---

## 4. Cambios a implementar

Implementa los siguientes cambios **en el orden indicado**. No añadas funcionalidades extra. No refactorices código que no sea necesario tocar.

---

### Cambio 1 — Crear `frontend/src/services/apiClient.ts`

Instancia Axios centralizada. Toda la comunicación con el backend pasa por aquí.

```ts
// frontend/src/services/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});
```

> `withCredentials: false` porque el BE usa JWT en header, no cookies.

---

### Cambio 2 — Crear `frontend/src/services/authService.ts`

Todas las llamadas HTTP de auth. Los componentes/hooks no conocen URLs ni Axios.

```ts
// frontend/src/services/authService.ts
import { apiClient } from "./apiClient";

export interface RespuestaLogin {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    foto?: string;
    rol: string;
  };
}

export const authService = {
  async registro(datos: { nombre: string; correo: string; contrasena: string }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>("/auth/registro", datos);
    return data;
  },

  async login(datos: { correo: string; contrasena: string }): Promise<RespuestaLogin> {
    const { data } = await apiClient.post<RespuestaLogin>("/auth/login", datos);
    return data;
  },

  async recuperarContrasena(datos: { correo: string }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>("/auth/recuperar-contrasena", datos);
    return data;
  },

  async nuevaContrasena(datos: { token: string; contrasena: string }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>("/auth/nueva-contrasena", datos);
    return data;
  },

  async verificarEmail(datos: { token: string }): Promise<{ mensaje: string }> {
    const { data } = await apiClient.post<{ mensaje: string }>("/auth/verificar-email", datos);
    return data;
  },
};
```

---

### Cambio 3 — Actualizar `frontend/src/lib/auth.ts`

Añadir `CredentialsProvider` que llama a `authService.login()`. El token JWT del backend se guarda en el JWT de NextAuth para uso futuro en llamadas autenticadas.

Hay que extender los tipos de NextAuth para incluir `backendToken` y `rol` en la sesión.

El fichero completo debe quedar así:

```ts
import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/services/authService";
import axios from "axios";

// ─── Extensión de tipos NextAuth ──────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      rol?: string;
      backendToken?: string;
    };
  }
  interface JWT {
    backendToken?: string;
    rol?: string;
  }
}

export const opcionesAuth: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        correo: { label: "Correo", type: "email" },
        contrasena: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) return null;

        try {
          const { token, usuario } = await authService.login({
            correo: credentials.correo,
            contrasena: credentials.contrasena,
          });

          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.correo,
            image: usuario.foto ?? null,
            // Campos extra — se propagan en el callback jwt
            backendToken: token,
            rol: usuario.rol,
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            // Propaga el mensaje del backend como error de NextAuth
            throw new Error(error.response?.data?.error ?? "Error de autenticación");
          }
          throw new Error("Error de autenticación");
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    newUser: "/completar-perfil",
    error: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.backendToken = (user as any).backendToken;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.rol = (user as any).rol;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.backendToken = token.backendToken as string | undefined;
        session.user.rol = token.rol as string | undefined;
      }
      return session;
    },
  },
};
```

> Nota: `newUser` cambia de `/registro` a `/completar-perfil` para que el flujo de Google OAuth redirija al onboarding tras el primer login.

---

### Cambio 4 — Actualizar `formularioRegistro.tsx`

Sustituir únicamente la función `alEnviar`. El resto del componente (UI, validaciones, animaciones) no cambia.

```ts
// Añadir al bloque de imports existente:
import { authService } from "@/services/authService";
import axios from "axios";

// Sustituir la función alEnviar completa:
const alEnviar = async (datos: DatosRegistro) => {
  setEstadoEnvio("cargando");
  setMensajeError(null);

  try {
    await authService.registro({
      nombre: datos.nombre,
      correo: datos.correo,
      contrasena: datos.contrasena,
      // confirmarContrasena no se envía al backend — ya validado por Zod
    });
    router.push(`/verificar-email/pendiente?email=${encodeURIComponent(datos.correo)}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.error;
      setMensajeError(
        msg === "Este correo ya está registrado"
          ? "Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?"
          : "No se pudo crear la cuenta. Inténtalo de nuevo en unos segundos."
      );
    } else {
      setMensajeError("No se pudo crear la cuenta. Inténtalo de nuevo en unos segundos.");
    }
    setEstadoEnvio("error");
  }
};
```

---

### Cambio 5 — Actualizar `formularioLogin.tsx`

Sustituir únicamente la función `alEnviar`. Hay que importar `signIn` de `next-auth/react`.

```ts
// Añadir al bloque de imports existente:
import { signIn } from "next-auth/react";

// Sustituir la función alEnviar completa:
const alEnviar = async (datos: DatosLogin) => {
  setEstadoEnvio("cargando");
  setMensajeError(null);

  const resultado = await signIn("credentials", {
    correo: datos.correo,
    contrasena: datos.contrasena,
    redirect: false,
  });

  if (resultado?.ok) {
    router.push("/home");
    return;
  }

  // resultado.error contiene el mensaje lanzado en authorize()
  if (resultado?.error === "Debes verificar tu correo antes de iniciar sesión") {
    setMensajeError(
      "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada."
    );
  } else {
    setMensajeError(
      "Correo o contraseña incorrectos. Comprueba tus datos e inténtalo de nuevo."
    );
  }
  setEstadoEnvio("error");
};
```

> `signIn` con `redirect: false` devuelve `{ ok, error }` sin redirigir. El error es el mensaje que lanzó `authorize()`.

---

### Cambio 6 — Actualizar `formularioRecuperarContrasena.tsx`

Sustituir únicamente la función `alEnviar`.

```ts
// Añadir al bloque de imports existente:
import { authService } from "@/services/authService";

// Sustituir la función alEnviar completa:
const alEnviar = async (datos: DatosRecuperarContrasena) => {
  setEstadoEnvio("cargando");
  setMensajeError(null);

  try {
    // El backend siempre devuelve 200 (nunca revela si el correo existe)
    await authService.recuperarContrasena({ correo: datos.correo });
    router.push(`/recuperar-contrasena/pendiente?email=${encodeURIComponent(datos.correo)}`);
  } catch {
    setMensajeError(
      "No se pudo enviar el correo. Inténtalo de nuevo en unos segundos."
    );
    setEstadoEnvio("error");
  }
};
```

---

### Cambio 7 — Actualizar `formularioNuevaContrasena.tsx`

Sustituir únicamente la función `alEnviar`. El componente ya recibe `token` como prop.

```ts
// Añadir al bloque de imports existente:
import { authService } from "@/services/authService";
import axios from "axios";

// Sustituir la función alEnviar completa:
const alEnviar = async (datos: DatosNuevaContrasena) => {
  setEstadoEnvio("cargando");
  setMensajeError(null);

  try {
    await authService.nuevaContrasena({
      token,            // prop recibida del padre (query string ?token=...)
      contrasena: datos.contrasena,
    });
    setEstadoEnvio("exito");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.error;
      setMensajeError(
        msg ?? "No se pudo cambiar la contraseña. El enlace puede haber expirado."
      );
    } else {
      setMensajeError("No se pudo cambiar la contraseña. El enlace puede haber expirado.");
    }
    setEstadoEnvio("error");
  }
};
```

---

### Cambio 8 — Añadir variable de entorno

En `frontend/.env.local` (si existe) o crear el fichero si no existe, añadir:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> Si el fichero ya existe, no toques las demás variables. Solo añade esta línea.

---

## 5. TODOs que quedan en mock (no tocar)

| Componente | TODO | Fase |
|---|---|---|
| `tarjetaVerificacionPendiente.tsx` | Reenvío verificación vía Resend | Fase 6 |
| `tarjetaRecuperacionPendiente.tsx` | Reenvío recuperación vía Resend | Fase 6 |
| Flujo `/verificar-email` | `POST /api/auth/verificar-email` | Fase 6 (depende de email) |

---

## 6. Verificación al terminar

Antes de marcar la tarea como completa, verifica:

1. `npm run build` en `frontend/` pasa sin errores TypeScript.
2. `npm run lint` en `frontend/` pasa sin warnings.
3. El `CredentialsProvider` usa `import CredentialsProvider from "next-auth/providers/credentials"` (no la versión deprecada).
4. Ningún componente importa `axios` directamente para llamadas al backend (solo `authService`).
5. `formularioLogin.tsx` no importa ni usa `authService.login()` directamente — usa `signIn("credentials", ...)`.

---

## 7. Actualización de `docs/context.md` al terminar

**Cuando todos los cambios estén implementados y el build pase**, actualiza `docs/context.md`:

### 7a. En la sección "Estado Actual", añade estas líneas al bloque de ✅:

```
- ✅ [AUTH-FE-BE] Capa de servicios FE creada: `apiClient.ts` + `authService.ts` en `frontend/src/services/`
- ✅ [AUTH-FE-BE] `lib/auth.ts` actualizado: CredentialsProvider real conectado a `POST /api/auth/login`
- ✅ [AUTH-FE-BE] `formularioRegistro.tsx` conectado a `POST /api/auth/registro` (maneja 409)
- ✅ [AUTH-FE-BE] `formularioLogin.tsx` conectado a NextAuth CredentialsProvider (maneja 401/403)
- ✅ [AUTH-FE-BE] `formularioRecuperarContrasena.tsx` conectado a `POST /api/auth/recuperar-contrasena`
- ✅ [AUTH-FE-BE] `formularioNuevaContrasena.tsx` conectado a `POST /api/auth/nueva-contrasena`
- ✅ [AUTH-FE-BE] `NEXT_PUBLIC_API_URL` añadido a `.env.local`
```

### 7b. En la sección "Auth — TODOs marcados en código", marca como completados:

- `[AUTH-002]` → cambiar a ✅: `formularioRegistro.tsx` — `POST /api/auth/registro` conectado
- `[AUTH-003]` → cambiar a ✅: `lib/auth.ts` — `CredentialsProvider` añadido
- `[AUTH-007]` → cambiar a ✅: `formularioLogin.tsx` — `signIn("credentials", ...)` conectado

Y añade los nuevos TODOs completados:
```
- ✅ [AUTH-008] `formularioRecuperarContrasena.tsx` — `POST /api/auth/recuperar-contrasena` conectado
- ✅ [AUTH-009] `formularioNuevaContrasena.tsx` — `POST /api/auth/nueva-contrasena` conectado
```

### 7c. En la sección "Rutas del proyecto", añade o actualiza:

```
| `frontend/src/services/apiClient.ts` | Axios instance centralizada | ✅ |
| `frontend/src/services/authService.ts` | Servicio HTTP de auth (5 métodos) | ✅ |
```

### 7d. Añade la siguiente nota al final de la sección "Auth — TODOs marcados en código":

```
## Limitación conocida — login con credenciales

El endpoint POST /api/auth/login verifica `cuentaVerificada` antes de devolver el token.
Hasta que Resend esté activo (Fase 6), los usuarios se crean en DB pero no pueden hacer
login con email/contraseña sin verificar manualmente la cuenta en MongoDB Atlas.
El login con Google OAuth sigue funcionando sin restricciones.
```

---

## 8. Estructura de ficheros resultante

```
frontend/src/
├── services/                       ← NUEVA carpeta
│   ├── apiClient.ts                ← NUEVO
│   └── authService.ts              ← NUEVO
├── lib/
│   └── auth.ts                     ← MODIFICADO (CredentialsProvider)
└── features/auth/components/
    ├── formularioRegistro.tsx      ← MODIFICADO (alEnviar real)
    ├── formularioLogin.tsx         ← MODIFICADO (signIn credentials)
    ├── formularioRecuperarContrasena.tsx ← MODIFICADO (alEnviar real)
    └── formularioNuevaContrasena.tsx    ← MODIFICADO (alEnviar real)
```
