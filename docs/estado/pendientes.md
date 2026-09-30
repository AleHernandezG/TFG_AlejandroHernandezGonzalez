# Qué falta en Cookr

Foto a 30 de septiembre de 2026, por la tarde. Sacada del plan, la auditoría, el diario, el código y
los logs de GitHub Actions. Si algo de aquí choca con `plan-2026-09.md`, manda el plan.

---

## Dónde estás ahora mismo

Estás en la rama `fix/cerrar-f8`, que sale de `develop` (`1181871`, el merge del PR #51). Tiene todo
F8 hecho y probado, **sin commitear**: 329 tests en verde en 23 ficheros, lint y tipos limpios en los
dos lados, y el E2E nuevo en verde en local.

El PR #52 (`develop` → `main`, el de los tests del Worker y el cierre de B7 y B8) está abierto, con
todos los checks en verde y sin conflictos. Es la primera vez que corre `ci-gemini-proxy` y ha pasado.

`docs/pr.md` sigue vacío y sin añadir a git: o lo rellenas o lo borras.

---

## Lo siguiente, en este orden

1. **Mergear el #52** a `main`. Así F8 llega a `main` en un PR aparte y no mezclado con B7.
2. **Commitear `fix/cerrar-f8`, PR a `develop` y después `develop` → `main`.**
3. **En cuanto Render esté Live, normalizar las alergias del perfil en Atlas**, primero en seco y luego
   con `-- --apply`. Desde el despliegue, un perfil con «gluten» guardado da 400 si su dueño toca las
   preferencias, así que no conviene dejarlo para otro día. Pasos exactos abajo.
4. **Poner Upstash en Render** (`UPSTASH_REDIS_URL` con la URL REST `https://` y `UPSTASH_REDIS_TOKEN`).
   Sin eso, el tope diario de Gemini y la caché de IA se borran en cada redeploy. Es lo único que falta
   para cerrar F7. Después, las comprobaciones del apartado 6 de `pruebas-manuales.md`.
5. **Probar el límite de login con dos redes de verdad** (móvil con datos y wifi). Desde un solo
   ordenador no se puede.
6. **Cambiar la contraseña de la cuenta de pruebas del seed en Atlas.** Está publicada en el repo y
   sigue entrando en producción.

### La normalización de alergias, paso a paso

Contra el `MONGODB_URI` de `backend/.env`, que tiene que apuntar a Atlas:

```bash
cd backend
npm run normalizar:alergias                  # en seco: qué cambiaría y qué no sabe traducir
npm run normalizar:alergias -- --apply       # escribe, con copia en backend/respaldos/
npm run normalizar:alergias                  # otra vez en seco: tiene que salir 0 cambios
```

Los valores que salen con ⚠️ no se tocan: se quedan en el perfil tal cual. Si alguno es una variante
evidente, se añade a `VARIANTES` en el script y se vuelve a pasar. Si no, se habla con el usuario o se
quita a mano. Para deshacer, el `--apply` imprime el comando exacto
(`npm run normalizar:alergias -- --restaurar "<fichero>"`).

---

## Todo lo que falta, bloque a bloque

### Hecho

| Bloque | Qué era |
|---|---|
| F0 | Correo: se queda con Gmail, Outlook/Hotmail puede no recibir. Asumido |
| F6 | Seguridad: login de Google verificado, proxy cerrado, búsqueda escapada, errores 404/500 |
| F7.1 a F7.5 | Índices, feed ordenado en Mongo, likes atómicos, imágenes en Cloudinary, comentarios aparte |
| F8.1 | Todas las rutas con cuerpo pasan por `validarBody`; ningún controlador importa Zod (sin commitear) |
| F8.2 | Un alérgeno fuera de los 14 da 400 en el perfil y en las preferencias (sin commitear) |
| F8.3 | Los dos `.env.example` cuadran con el código, probado en un clon limpio (sin commitear) |
| F8.4 | El detalle de receta es público, ADR 0001, `/completar-perfil` en el `matcher` (sin commitear) |
| F9.3 | El Worker entra en el CI (en `develop`, falta el #52) |
| F10.2, F10.5 | Índice de `docs/` y ordenar lo que estaba fuera de git |
| B7, B8 | Límite de login por IP real y restos menores |
| UI | UI-001 a UI-010, UI-012 y UI-016 |

### A medias

| Bloque | Qué falta exactamente |
|---|---|
| F7.6 | Las variables de Upstash en Render (ver arriba) |
| F8.2 en Atlas | Pasar `normalizar:alergias` (ver arriba). Después, el `enum` en `usuarioMongo.ts`, que hoy no está a propósito: con datos viejos, cualquier guardado de ese usuario reventaría |
| Login y `callbackUrl` | Un visitante que pulsa «me gusta» va a `/login?callbackUrl=/recetas/<id>`, pero tras entrar acaba en `/home`. Para respetarlo hay que validar que el destino es una ruta interna (empieza por `/` y no por `//`), o se abre una redirección a cualquier web |
| F9.1 · Tests del dominio | Hay 329 tests, pero la última cobertura medida es del 4/09 (36 %). Toca volver a medir con `npm run test:cov` |
| F10.4 · Decisiones | Está la carpeta y la primera ficha (`0001-detalle-receta-publico.md`). Faltan las de lo que ya estaba decidido: correo por HTTP, doble token, alérgenos como suelo... |
| Pruebas manuales | 44 casillas sin marcar en `pruebas-manuales.md`, entre ellas Google real en producción y el correo a Outlook |
| `REVISION_DESPLIEGUE.md` | El checklist sigue sin marcar, salvo la parte del proxy |

### Sin empezar

| Bloque | Qué es | Coste estimado |
|---|---|---|
| F9.2 | Tests "barrera": fallan si alguien se salta una regla de `CLAUDE.md` (rutas sin `validarBody`, servicios que importan modelos, variables que no están en `.env.example`). Con F8 cerrado, ya se pueden escribir sin que fallen el primer día | 1 día |
| F10.3 | Contrato de la API: los 37 endpoints documentados en `docs/referencia/` | 1 día |
| F11 | Hooks y skills del método de trabajo | 1 día |
| F13 | Respuestas del chat en streaming (SSE). No hay nada en el código | 2 días |
| F14 | Despensa con unidades normalizadas y "he cocinado esta receta". **Tapona casi todo F12** | 2,5 días |
| F15 | Búsqueda que perdone tildes y erratas | 1,5 días |
| F12 | Producto: planificador, lista de la compra, modo cocina, importar recetas... | ~12 días las dos primeras tandas |
| PWA | Instalar Cookr como app (`pwa.md`) | diseñado, sin hacer |
| Eventos | Eventos semanales de verdad (`eventos.md`) | diseñado, sin hacer |
| UI | UI-011 (tablet 768-1023 px sin diseño), UI-013, UI-014, UI-015, UI-017 | |

Restos pequeños que siguen ahí: las fotos huérfanas de Cloudinary de antes de REV-005, que hay que
borrar a mano. Los `console.log` de `backend/src` son 142, pero 139 están en `src/scripts/`, donde son
la salida del script y deben quedarse; fuera de ahí solo quedan 3.

Para arrancar un clon limpio no basta con copiar las plantillas: el `MONGODB_URI` de ejemplo no existe
y el backend muere con `querySrv EBADNAME`. Con `MONGODB_URI` y `JWT_SECRET` rellenos arranca, pero sin
Mailjet no sale el correo de verificación, y la cuenta hay que verificarla a mano en la base.

---

## Qué dicen los logs de GitHub

Las ejecuciones del PR #52 (30/09) están **todas en verde**:

| Job | Resultado |
|---|---|
| Backend: typecheck y tests | ✅ |
| Frontend: lint y typecheck | ✅ |
| Tests del Worker (`ci-gemini-proxy`) | ✅, primera vez que corre |
| E2E con Playwright | ✅ en unos 2 min |
| Deploy a Vercel y Render | se salta, como toca en un PR |

La última de `main` sigue siendo la del #50 (run `36599859639`, 29/09), también en verde. Cuando entre
F8, el backend tiene que salir con 329 tests en 23 ficheros y el E2E con 5: los 2 de siempre y los 3
de `recetaPublica.spec.ts`.

La fuga de handles de Jest que salía antes **no aparece** en las últimas ejecuciones. Buena señal,
aunque sigue sin explicación.

Avisos que no rompen nada pero conviene mirar algún día:

- `actions/cache@v4` apunta a Node 20, que GitHub ya da por obsoleto y fuerza a Node 24. Subir a
  la versión siguiente de la acción lo quita.
- `npm install` avisa de paquetes viejos que vienen de dependencias de otras: `glob@7`, `glob@10`,
  `inflight`, `rimraf@2/3` y los `workbox-*` del frontend (de `next-pwa`). No son tuyos directamente;
  se van al actualizar lo que los arrastra.
- Avisos de Node sobre `punycode` y `url.parse()`: vienen de las herramientas, no del código de Cookr.

---

## Si solo tienes una tarde

Mergea el #52, sube F8 hasta `main` y pasa la normalización de alergias en cuanto Render esté Live.
Si sobra rato, Upstash en Render: con eso F7 y F8 quedan cerrados del todo, y lo siguiente gordo ya es
F14, que es lo que desbloquea el producto.
