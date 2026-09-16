# API Changes — Cookr

## [API-002] CORS — Configurar orígenes permitidos para producción
Fecha:   2026-03-25 | Estado: ⏳ Pendiente | Afecta: solo BE | Fase: 6

Cambio:
  En producción el backend solo acepta peticiones desde cookr.vercel.app
  En desarrollo acepta localhost:3000

Implementación en backend/src/app.js:
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://cookr.vercel.app']
      : ['http://localhost:3000']

  app.use(cors({ origin: allowedOrigins, credentials: true }))

Archivos afectados:
  BE: backend/src/app.js → configurar cors con allowedOrigins
  BE: backend/.env.production → FRONTEND_URL=https://cookr.vercel.app

Motivo: Seguridad — evitar que otras apps llamen a la API de producción

---

## [API-004] BE Auth — POST /api/auth/registro
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 2

  POST /api/auth/registro
  Body: { nombre, correo, contrasena }
  Validación: Zod schema en backend
  Lógica: bcrypt hash → guardar Usuario → generar Token verificación
  Response 201: { mensaje: "Revisa tu correo para verificar la cuenta" }
  Response 400: errores Zod
  Response 409: correo ya registrado

Archivos BE a crear:
  backend/src/models/Usuario.model.ts
  backend/src/models/Token.model.ts
  backend/src/controllers/auth.controller.ts
  backend/src/routes/auth.routes.ts
  backend/src/middlewares/validar.middleware.ts
  backend/src/lib/db.ts
  backend/src/lib/jwt.ts

---

## [API-005] BE Auth — POST /api/auth/login
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 2

  POST /api/auth/login
  Body: { correo, contrasena }
  Lógica: buscar usuario → bcrypt.compare → generar JWT sesión
  Response 200: { token, usuario: { id, nombre, correo, foto, rol } }
  Response 401: credenciales inválidas
  Response 403: cuenta no verificada

---

## [API-006] BE Auth — POST /api/auth/verificar-email
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 2

  POST /api/auth/verificar-email
  Body: { token }
  Lógica: validar JWT firma + expiración + existe en BD → cuentaVerificada=true → invalidar token
  Response 200: { mensaje: "Email verificado correctamente" }
  Response 400: token inválido o expirado

---

## [API-007] BE Auth — POST /api/auth/recuperar-contrasena
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 2

  POST /api/auth/recuperar-contrasena
  Body: { correo }
  Lógica: buscar usuario → generar token hex 1h → guardar en Token → enviar email vía Gmail SMTP (EMAIL-001)
  Response 200: { mensaje: "Si el correo existe recibirás un enlace" }

---

## [API-008] BE Auth — POST /api/auth/nueva-contrasena
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 2

  POST /api/auth/nueva-contrasena
  Body: { token, contrasena }
  Lógica: validar token → bcrypt nueva contraseña → actualizar Usuario → invalidar token
  Response 200: { mensaje: "Contraseña actualizada correctamente" }
  Response 400: token inválido, expirado o ya usado

---

## [API-009] JWT Middleware
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 2

  Middleware para rutas protegidas
  Lee: Authorization: Bearer <token>
  Verifica firma JWT con JWT_SECRET
  Adjunta req.usuario = { id, correo, rol }
  Response 401: sin token o token inválido
  Response 403: token expirado

  Archivo: backend/src/middlewares/auth.middleware.ts

---

## [API-010] Crear `src/services/apiClient.ts`
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4

Motivo: capa de abstracción HTTP entre todos los services FE y el backend.
        Actualmente no existe ninguna instancia Axios centralizada.
        Sin este fichero, cada service tendría que configurar headers y
        base URL por separado.

Qué implementar:
  - Instancia Axios con `baseURL = process.env.NEXT_PUBLIC_API_URL`
  - Interceptor de request: adjuntar `Authorization: Bearer <token>` desde NextAuth
  - Interceptor de response: capturar 401 → redirigir a /login

Archivos afectados:
  `src/services/apiClient.ts` → CREAR

---

## [API-011] Crear `src/services/authService.ts`
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4

Motivo: capa de abstracción entre los hooks de auth y Axios.
        Detectado en auditoría: formularioRegistro, formularioLogin,
        formularioRecuperarContrasena y formularioNuevaContrasena contienen
        lógica de envío directa (mock) que debe moverse aquí en Fase 4.

Métodos a implementar:
  `authService.registro(datos: DatosRegistro)`
  `authService.login(datos: DatosLogin)`
  `authService.verificarEmail(token: string)`
  `authService.recuperarContrasena(correo: string)`
  `authService.nuevaContrasena(token: string, contrasena: string)`
  `authService.reenviarVerificacion(email: string)`
  `authService.reenviarRecuperacion(correo: string)`

Archivos afectados:
  `src/services/authService.ts` → CREAR
  `src/services/apiClient.ts` → DEBE EXISTIR ANTES (ver API-010)

---

## [API-012] Crear `src/features/auth/hooks/useAuth.ts`
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4

Motivo: hook de abstracción entre los componentes auth y authService.
        Detectado en auditoría: los 6 componentes auth tienen lógica de
        envío inline que debe extraerse a este hook.

Métodos a implementar:
  `useRegistro()` → llama a `authService.registro`, gestiona estado cargando/error/exito
  `useLogin()` → llama a `authService.login`
  `useRecuperarContrasena()` → llama a `authService.recuperarContrasena`
  `useNuevaContrasena(token)` → llama a `authService.nuevaContrasena`
  `useReenviarVerificacion(email)` → llama a `authService.reenviarVerificacion`
  `useReenviarRecuperacion(correo)` → llama a `authService.reenviarRecuperacion`

Archivos afectados:
  `src/features/auth/hooks/useAuth.ts` → CREAR
  `src/services/authService.ts` → DEBE EXISTIR ANTES (ver API-011)
  `src/features/auth/components/formularioRegistro.tsx` → MODIFICAR (ver UI-008)
  `src/features/auth/components/formularioLogin.tsx` → MODIFICAR (ver UI-009)
  `src/features/auth/components/formularioRecuperarContrasena.tsx` → MODIFICAR (ver UI-010)
  `src/features/auth/components/formularioNuevaContrasena.tsx` → MODIFICAR (ver UI-011)
  `src/features/auth/components/tarjetaVerificacionPendiente.tsx` → MODIFICAR (ver UI-012)
  `src/features/auth/components/tarjetaRecuperacionPendiente.tsx` → MODIFICAR (ver UI-013)

---

## [API-003] NextAuth — Actualizar NEXTAUTH_URL para producción
Fecha:   2026-03-25 | Estado: ⏳ Pendiente | Afecta: FE | Fase: 6

Cambio:
  Solo tocar en Fase 6 al hacer el deploy. No tocar antes.

  Desarrollo (actual, no modificar):
    NEXTAUTH_URL=http://localhost:3000

  Producción (solo en Fase 6):
    NEXTAUTH_URL=https://cookr.vercel.app
    (añadir en Vercel → Settings → Environment Variables)

Pasos en Fase 6 (un único día):
  1. Añadir en Vercel → Environment Variables:
       NEXTAUTH_URL=https://cookr.vercel.app
  2. Añadir en Google Cloud Console → OAuth 2.0 Client ID:
       Authorized redirect URIs:
         https://cookr.vercel.app/api/auth/callback/google
       Authorized JavaScript origins:
         https://cookr.vercel.app
  3. Verificar login con Google en producción

Motivo: Google OAuth exige que NEXTAUTH_URL coincida exactamente
        con la URI registrada — cualquier diferencia rompe el login

---

## [EMAIL-001] Integración Nodemailer + Gmail SMTP — eliminación rutas dev
Fecha:   2026-04-22 | Estado: ✅ Completado | Afecta: BE | Sprint: 3 (Fase 6 adelantada)

Cambio:
  Sustituidos los 2 TODO [Fase 6] de authService.ts por llamadas reales a Gmail SMTP vía Nodemailer.
  Eliminadas todas las rutas y código temporal de desarrollo.

Archivos creados:
  backend/src/lib/email.ts          → transporter Nodemailer + enviarEmailVerificacion() + enviarEmailRecuperacion() + plantillas HTML

Archivos modificados:
  backend/src/services/authService.ts  → reemplaza TODO en registrarse() y solicitarRecuperacion()
  backend/src/app.ts                   → eliminados import devRoutes y bloque condicional NODE_ENV=development
  backend/.env.example                 → sustituye RESEND_API_KEY por GMAIL_USER + GMAIL_APP_PASSWORD

Archivos eliminados:
  backend/src/routes/dev.routes.ts     → ruta temporal POST /api/dev/verificar-usuario

Variables de entorno nuevas:
  GMAIL_USER          → cuenta Gmail desde la que se envían los emails
  GMAIL_APP_PASSWORD  → contraseña de aplicación de 16 caracteres (no la contraseña normal de Gmail)

Política de errores:
  Si Gmail SMTP falla → se loguea el error pero no se hace throw.
  El usuario ya existe en DB y puede solicitar reenvío desde /verificar-email/pendiente.
  Endpoint POST /api/auth/verificar-email/reenviar implementado — reutiliza enviarEmailVerificacion().

Motivo: EMAIL-001 — activar el flujo completo de email sin depender de Resend/dominio propio.

---

## [API-013] BE Recetas — POST /api/recetas

Fecha: 2026-04-26 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 5

  POST /api/recetas
  Auth: Bearer JWT requerido (middleware auth)
  Body (multipart/form-data o JSON):
    { titulo, descripcion, ingredientes, pasos, dietas, dificultad, tiempo, porciones, foto? }
  Lógica:
    1. Validar body con Zod schema
    2. Si foto vacía → llamar Pexels API con titulo como query → guardar URL + créditos
    3. Calcular alergenos automáticamente desde ingredientes
    4. Guardar en MongoDB (colección recetas) vía recetaRepository
  Response 201: { receta: IReceta }
  Response 400: errores Zod
  Response 401: sin autenticar

Archivos BE a crear:
  backend/src/types/receta.ts                  → interfaz IReceta pura (ARCH-001)
  backend/src/models/recetaMongo.ts             → IRecetaDoc + Mongoose schema
  backend/src/repositories/recetaRepository.ts → toda la comunicación con MongoDB
  backend/src/controllers/receta.controller.ts
  backend/src/routes/receta.routes.ts
  backend/src/services/pexelsService.ts         → wrapper Pexels API (ver FOTO-001)

Variables de entorno nuevas:
  PEXELS_API_KEY → clave API de api.pexels.com

Relacionado: DOM-003, FOTO-001

---

## [API-014] BE Recetas — GET /api/recetas + GET /api/recetas/:id

Fecha: 2026-04-26 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 5

  GET /api/recetas
  Auth: opcional
  Query params: dieta?, dificultad?, tiempo?, page?, limit?
  Lógica: recetaRepository.listar con filtros + paginación
  Response 200: { recetas: IReceta[], total, page, totalPages }

  GET /api/recetas/:id
  Auth: opcional
  Lógica: recetaRepository.porId(id) — 404 si no existe
  Response 200: { receta: IReceta }
  Response 404: receta no encontrada

Archivos BE:
  backend/src/controllers/receta.controller.ts → MODIFICAR (añadir listar + porId)
  backend/src/repositories/recetaRepository.ts → MODIFICAR (añadir métodos)

Relacionado: DOM-003, API-013

---

## [FOTO-001] Integración Pexels API — foto automática en recetas

Fecha: 2026-04-26 | Estado: ⏳ Pendiente | Afecta: BE | Sprint: 5

Descripción:
  Cuando el usuario no sube foto al crear una receta, el backend busca
  automáticamente una foto en Pexels usando el título de la receta como query.
  La URL y los créditos se guardan en MongoDB (campos fotoFuente + fotoCredito).

Flujo en backend (POST /api/recetas):

  1. Recibir receta sin foto
  2. `GET <https://api.pexels.com/v1/search?query={titulo}&per_page=1>` — Header: `Authorization: PEXELS_API_KEY`
  3. Extraer: `photos[0].src.large2x` + `photographer` + `url` + `photographer_url`
  4. Guardar en MongoDB: `foto`, `fotoFuente: 'pexels'`, `fotoCredito: { fotografo, urlFoto, urlPerfil }`

Archivos a crear:
  backend/src/services/pexelsService.ts → buscarFotoPorTitulo(titulo: string)

Variables de entorno:
  PEXELS_API_KEY (límite: 200 req/hora, suficiente para TFG)

Nota evolutiva: en versiones futuras se podría usar Cloudinary AI semantic search
  para reutilizar fotos ya subidas por usuarios, evitando llamadas externas repetidas.

Relacionado: DOM-003 (campos fotoFuente, fotoCredito), FOTO-002, API-013

---

## [FOTO-002] FE Receta — mostrar créditos Pexels en detalle receta

Fecha: 2026-04-26 | Estado: ⏳ Pendiente | Afecta: FE | Sprint: 5

Descripción:
  La licencia de Pexels exige atribución obligatoria. Cuando fotoFuente === 'pexels',
  el componente de detalle de receta debe mostrar debajo de la imagen los créditos
  con dos enlaces: perfil del fotógrafo y URL de la foto original en Pexels.

Markup JSX a implementar (solo si `receta.fotoFuente === 'pexels'`):

```tsx
<p className="text-xs text-muted-foreground mt-1">
  Foto por{' '}
  <a href={receta.fotoCredito.urlPerfil} target="_blank" rel="noopener noreferrer"
     className="underline hover:text-foreground">
    {receta.fotoCredito.fotografo}
  </a>
  {' '}en{' '}
  <a href={receta.fotoCredito.urlFoto} target="_blank" rel="noopener noreferrer"
     className="underline hover:text-foreground">
    Pexels
  </a>
</p>
```

Archivos FE a modificar:
  frontend/src/features/recetas/components/detalleReceta/... → PENDIENTE CREAR (Sprint 4)

Relacionado: FOTO-001, DOM-003
