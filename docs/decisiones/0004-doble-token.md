# 0004 · Doble token: la sesión de NextAuth lleva dentro el JWT del backend

**Fecha:** escrita el 4 de octubre de 2026; la decisión es anterior y ya estaba en `CLAUDE.md` · **Estado:** aceptada · **Origen:** F10.4 del plan, regla «Doble token» de `CLAUDE.md`

## Contexto

Cookr son dos unidades que se despliegan por separado: el cliente Next.js en Vercel y la API Express
en Render. El cliente usa NextAuth para el login, con credenciales y con Google. La API tiene que
saber quién llama sin depender de la cookie de otro dominio.

## Decisión

Hay dos sesiones:

1. La de NextAuth, una cookie del frontend, configurada en `frontend/src/lib/auth.ts`.
2. El JWT propio del backend, de 7 días, firmado en `backend/src/lib/jwt.ts`.

El segundo viaja dentro del primero, como `session.user.backendToken`, y es el único que autentica
contra la API. Con credenciales, `authorize()` llama a `POST /api/auth/login` y guarda el JWT que
devuelve. Con Google, el callback `jwt` llama a `POST /api/auth/google` con el `id_token`, y el
backend lo verifica antes de crear o recuperar el usuario.

Cada llamada autenticada pasa la cabecera a mano: `apiClient` es un axios sin interceptor.

## Alternativa descartada

Las dos obvias son que el backend valide directamente el token de NextAuth compartiendo el secreto,
o prescindir de NextAuth y guardar solo el JWT del backend en el cliente.

**Por qué se descartaron no está escrito.** `CLAUDE.md` explica cómo funciona el doble token y qué
se rompe si se usa mal, pero no por qué se eligió frente a esas dos, y en `docs/cambios/` no aparece.
Esta ficha no lo rellena con un motivo supuesto. Si alguien lo recuerda o lo reconstruye, va en una
ficha nueva que sustituya a esta.

## Consecuencias

- Un endpoint autenticado nuevo que olvide la cabecera `Authorization` da 401 aunque el usuario esté
  logueado en el frontend. Es la fuente habitual de confusión del proyecto.
- El token de NextAuth es una cookie y tiene tamaño. Nunca se mete un `data:` URI en él: revienta la
  cookie y rompe el login. En `lib/auth.ts` hay filtros explícitos; las fotos base64 viven en el
  perfil del backend y en la sesión solo van URL `http(s)`.
- Hay dos caducidades que nadie sincroniza. El JWT del backend dura 7 días y en `lib/auth.ts` no hay
  nada que lo renueve ni que acorte la sesión de NextAuth para que acabe a la vez. Cuando el primero
  caduca y la cookie sigue viva, el usuario aparece con sesión y cada llamada devuelve 401.
- Las rutas protegidas del cliente se declaran aparte, en el `matcher` de
  `frontend/src/middleware.ts`. Son dos listas, la del cliente y la del backend, y pueden dejar de
  coincidir: fue el hallazgo M5, que acabó en la ficha 0001.
- El login y el de Google salen del servidor de Vercel, no del navegador. Sin
  `cabecerasIpCliente()`, todos los usuarios comparten cupo en los limitadores por IP.
- El destino tras el login (`callbackUrl`) lo decide el frontend, así que se valida allí, en
  `frontend/src/lib/destinoTrasLogin.ts`.
