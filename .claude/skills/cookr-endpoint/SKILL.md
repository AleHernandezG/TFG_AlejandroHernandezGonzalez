---
name: cookr-endpoint
description: Añadir o modificar un endpoint del backend de Cookr respetando la arquitectura por capas, la validación con Zod y el cableado con el frontend. Úsala al crear rutas, controladores, servicios o repositorios.
---

# Añadir un endpoint en Cookr

Orden de trabajo: **modelo → repositorio → servicio → controlador → ruta → servicio del frontend → hook**. No te saltes capas.

## 1. Repositorio (`backend/src/repositories/`)

Es la **única** capa que importa modelos de Mongoose. Devuelve documentos o datos planos, nunca objetos de Express.

```ts
import { Receta } from "../models/recetaMongo";

export const recetaRepository = {
  async obtenerPorId(id: string) {
    return Receta.findById(id).lean();
  },
};
```

## 2. Servicio (`backend/src/services/`)

Lógica de negocio. **No importa Mongoose ni conoce `req`/`res`.** Los errores llevan el status embebido:

```ts
throw Object.assign(new Error("La receta no existe"), { status: 404 });
```

Es el patrón que ya usa `chatService.ts`. Sin él, el controlador devolverá 500.

## 3. Controlador (`backend/src/controllers/`)

Fino: llama al servicio, responde, delega el error. Cada controlador define su propia copia de `manejarError`:

```ts
type ErrorConStatus = Error & { status?: number };

function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno del servidor" });
}

export const recetasController = {
  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtener(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },
};
```

Está duplicado en los cuatro controladores. Si trabajas en un controlador nuevo, copia el patrón; si lo unificas, hazlo en todos a la vez.

**No uses `next(error)`.** Ningún controlador lo hace y el middleware global `manejadorErrores` no está preparado (devuelve 500 siempre y descarta `err.status`).

## 4. Esquema Zod (`backend/src/lib/validadores.ts`)

Todos los esquemas viven aquí. Nombrado: `esquema<Accion><Recurso>`.

```ts
export const esquemaCrearReceta = z.object({
  titulo: z.string().min(3),
  raciones: z.number().int().positive(),
});
```

## 5. Ruta (`backend/src/routes/`)

Aquí se compone todo. **La validación y la autenticación van en la ruta, nunca dentro del controlador.**

```ts
router.post(
  "/",
  requerirAuth,                       // rellena req.usuario
  validarBody(esquemaCrearReceta),    // 400 + { error, errores[] } si falla
  limitarPorUsuario(10),              // solo si consume IA o APIs externas
  recetasController.crear,
);
```

Middlewares disponibles:

- `requerirAuth` — obligatoria. Rellena `req.usuario`.
- `optionalAuth` — sesión opcional (feeds que cambian si hay usuario). Ya se usa en `recetas.routes.ts` y `usuarios.routes.ts`.
- `validarBody(esquema)` — sustituye `req.body` por el dato parseado.
- `limitarPorUsuario(n)` — **solo protege rutas autenticadas**. Si no hay `req.usuario` deja pasar. No sirve para proteger login ni rutas públicas.

Registra el router en `backend/src/app.ts` bajo `/api/<recurso>` si es un recurso nuevo.

## 6. Frontend

Primero el servicio (`frontend/src/services/<recurso>Service.ts`). **`apiClient` no tiene interceptor: la cabecera va a mano.**

```ts
export const recetasService = {
  async crear(datos: DatosReceta, token: string) {
    const { data } = await apiClient.post("/recetas", datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
```

Después el hook en `frontend/src/features/<feature>/hooks/`, que es lo que consumen los componentes:

```ts
export function useCrearReceta() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosReceta) =>
      recetasService.crear(datos, session!.user.backendToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recetas"] }),
  });
}
```

El token siempre sale de `session.user.backendToken` (el JWT del backend), **no** del token de NextAuth. Los componentes no llaman a `apiClient` ni a `services/` directamente: pasan por el hook.

Si el endpoint respalda una página nueva que requiere sesión, añádela al `matcher` de `frontend/src/middleware.ts`.

## Antes de dar por hecho el trabajo

```bash
cd backend && npm run lint    # tsc --noEmit
cd frontend && npm run lint && npx tsc --noEmit
```

## Convenciones

Dominio en español (`recetas`, `despensa`, `alergenos`). No traduzcas identificadores existentes. Sin comentarios en el código.
