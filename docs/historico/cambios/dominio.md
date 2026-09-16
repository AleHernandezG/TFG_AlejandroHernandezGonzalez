# Domain Changes — Cookr

Registro de cambios en el modelo de dominio y schemas de MongoDB. Formato: [DOM-XXX] por orden cronológico.

> **Regla de oro:** nunca editar una entrada completada. Si el modelo evoluciona, crear una nueva entrada.

---

## [DOM-001] MongoDB — Modelo Usuario

Fecha: 2026-03-29 | Estado: ⏳ Pendiente | Sprint: 2

Colección: `usuarios` | Índice único: `correo`

Campos:

- `_id` — ObjectId generado por MongoDB
- `nombre` — String, 2–50 caracteres, requerido
- `correo` — String, único, lowercase, requerido
- `contrasena` — String, bcrypt hash, opcional (null para Google OAuth)
- `foto` — String URL Cloudinary, opcional
- `rol` — enum `['usuario', 'admin']`, default `'usuario'`
- `cuentaVerificada` — Boolean, default `false`
- `proveedor` — enum `['local', 'google']`, requerido
- `googleId` — String, opcional (solo si proveedor = 'google')
- `alergias` — `[String]`, default `[]`
- `preferencias` — `[String]`, default `[]`
- `fechaRegistro` — Date, default `Date.now`

Archivo: `backend/src/models/Usuario.model.ts`

---

## [DOM-002] MongoDB — Modelo Token

Fecha: 2026-03-29 | Estado: ⏳ Pendiente | Sprint: 2

Colección: `tokens` | TTL index en campo `expira`

Campos:

- `_id` — ObjectId generado por MongoDB
- `userId` — ObjectId, ref `Usuario`, requerido
- `token` — String, único, requerido
- `tipo` — enum `['verificacion', 'recuperacion']`, requerido
- `expira` — Date, TTL index (MongoDB borra automáticamente al expirar)
- `usado` — Boolean, default `false`
- `creadoEn` — Date, default `Date.now`

Uso:

- `verificacion` → expira en 24h, generado al registrarse
- `recuperacion` → expira en 1h, generado al pedir recuperación de contraseña

Archivo: `backend/src/models/Token.model.ts`

---

## [DOM-003] MongoDB — Modelo Receta

Fecha: 2026-04-26 | Estado: ⏳ Pendiente implementar | Sprint: 4

Colección: `recetas` | Índices: `autor`, `dietas`, `dificultad`, `creadoEn`

### Campos

| Campo          | Tipo                                  | Restricciones                          |
| -------------- | ------------------------------------- | -------------------------------------- |
| `titulo`       | String                                | required, trim, 3–100 chars            |
| `descripcion`  | String                                | required, trim, 10–300 chars           |
| `autor`        | ObjectId ref `Usuario`                | required                               |
| `foto`         | String (URL)                          | opcional                               |
| `fotoFuente`   | enum `usuario \| pexels \| cloudinary`| default `usuario`                      |
| `fotoCredito`  | `{ fotografo, urlFoto, urlPerfil }`   | solo si `fotoFuente === 'pexels'`       |
| `ingredientes` | `[{ nombre, cantidad, unidad }]`      | min 1 elemento                         |
| `pasos`        | `[String]`                            | min 1 elemento                         |
| `dietas`       | `[String]`                            | ids de `DIETAS_OPCIONES`               |
| `alergenos`    | `[String]`                            | ids de `ALERGENOS_OPCIONES`, auto-det. |
| `dificultad`   | enum `facil \| media \| dificil`      | required                               |
| `tiempo`       | Number                                | required, min 1 (minutos)              |
| `porciones`    | Number                                | required, min 1                        |
| `likes`        | `[ObjectId]` ref `Usuario`            | default `[]`                           |
| `guardadoPor`  | `[ObjectId]` ref `Usuario`            | default `[]`                           |
| `creadoEn`     | Date                                  | auto via `timestamps`                  |

### Separación dominio / Mongoose (patrón ARCH-001)

- `backend/src/types/receta.ts` — interfaz `IReceta` pura (sin `Document`)
- `backend/src/models/recetaMongo.ts` — `IRecetaDoc extends IReceta, Document` + schema Mongoose
- `backend/src/repositories/recetaRepository.ts` — toda la comunicación con MongoDB

### Nota fotoCredito

El campo `fotoCredito` es necesario para cumplir la licencia Pexels (atribución obligatoria).
Solo se rellena cuando `fotoFuente === 'pexels'`. Ver `docs/historico/desarrollo/crearReceta.html §pexels-creditos`.
