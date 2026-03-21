# Fase 1 — Sprint 1 — Reporte TFG-15 (Página de Registro)

**Fecha:** 2026-03-21
**Estado:** ✅ Implementado (mock — backend pendiente Fase 4)

## Objetivo

Implementar la vista de registro `/registro` con validación local, Google OAuth funcional y arquitectura preparada para conectar al backend en Fase 4.

## Criterios de aceptación

- ✅ Formulario con nombre, correo, contraseña y confirmación
- ✅ Validación con Zod — errores inline en tiempo real
- ✅ Toggle mostrar/ocultar contraseña
- ✅ Google OAuth funcional (redirige a "/" hasta que exista /feed)
- ✅ Estado de éxito con pantalla de confirmación
- ✅ Estado de error con mensaje descriptivo
- ✅ Animaciones de entrada con Framer Motion
- ✅ Accesibilidad: aria-invalid, role="alert", aria-label en botones de toggle
- ✅ Responsive mobile-first
- ✅ Nomenclatura en español / camelCase consistente con el resto del proyecto
- ✅ NextAuth configurado con route handler y opcionesAuth

## Archivos creados

| Archivo | Descripción |
|---|---|
| `src/lib/auth.ts` | NextAuthOptions (GoogleProvider, JWT, callbacks) |
| `src/app/api/auth/[...nextauth]/route.ts` | Route handler GET/POST para NextAuth |
| `src/features/auth/types/autenticacion.ts` | esquemaRegistro Zod, DatosRegistro, EstadoFormulario |
| `src/features/auth/components/botonGoogle.tsx` | Botón OAuth con SVG Google y estado de carga |
| `src/features/auth/components/divisorOAuth.tsx` | Separador visual entre OAuth y formulario email |
| `src/features/auth/components/formularioRegistro.tsx` | Formulario principal con RHF + Zod |
| `src/features/auth/components/index.ts` | Barrel export del feature auth |
| `src/app/registro/page.tsx` | Ruta /registro — Server Component con metadata |

## Arquitectura del feature `auth`

```
features/auth/
├── components/
│   ├── botonGoogle.tsx       ← OAuth button (Client Component)
│   ├── divisorOAuth.tsx      ← "o continúa con correo" divider
│   ├── formularioRegistro.tsx ← Form principal (Client Component)
│   └── index.ts              ← Barrel export
└── types/
    └── autenticacion.ts      ← Zod schema + TypeScript types
```

## Esquema de validación Zod

```ts
esquemaRegistro = z.object({
  nombre:              min 2 / max 50 / trim
  correo:              email / trim
  contrasena:          min 8 / ≥1 letra / ≥1 número
  confirmarContrasena: igual a contrasena (refine)
})
```

## Estado del envío

| Estado | Descripción |
|---|---|
| `idle` | Formulario listo para rellenar |
| `cargando` | Enviando datos (botón deshabilitado, spinner) |
| `exito` | Pantalla de confirmación con CheckCircle |
| `error` | Mensaje de error en banner rojo, formulario reactivo |

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Google OAuth primero, correo después | Reduce fricción — OAuth es el flujo más rápido |
| Mock en submit email/contraseña | No hay backend hasta Fase 4; la validación local ya está completa |
| `noValidate` en el form | Evita validación nativa del navegador; Zod es la única fuente de verdad |
| Fondo decorativo con blobs | Consistente con el lenguaje visual de la landing (gradientes suaves, no fotografías) |
| Server Component para la página | Permite exportar metadata sin JS extra en el cliente |

## Pendientes y TODOs marcados en código

| Ticket | Descripción |
|---|---|
| TODO Fase 4 | Conectar `alEnviar` con `POST /api/usuarios/registro` del backend |
| TODO Fase 2 | Cambiar `callbackUrl` de Google OAuth de `"/"` a `"/feed"` |
| TODO Fase 4 | Añadir `CredentialsProvider` a `opcionesAuth` en `lib/auth.ts` |
| TODO Fase 4 | Enriquecer callback `session` con ID de usuario del backend |

## Siguiente paso de Sprint 1

- Implementar página de Login (`/login`) — TFG-16
- Reutilizar `BotonGoogle` y `DivisorOAuth` del feature auth
