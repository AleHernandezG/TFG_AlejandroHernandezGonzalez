# Qué falta en Cookr

Foto a 4 de octubre de 2026. Sacada del plan, la auditoría, el diario y el código. Los logs de GitHub
Actions del final siguen siendo los del 30 de septiembre: la sesión del 4 de octubre no usó `gh`. Si
algo de aquí choca con `plan-2026-09.md`, manda el plan.

---

## Dónde estás ahora mismo

Estás en la rama `feat/barreras-contrato-callback`, que sale de `develop` (`aac6214`, el merge del
PR #53). Tiene seis bloques hechos y **sin commitear**: el `callbackUrl` tras el login, el test del
endpoint de seguir (con un bug arreglado), las barreras de F9.2, la medición de F9.1, el contrato de
la API (F10.3) y las fichas de decisiones (F10.4). 366 tests en verde en 26 ficheros, lint y tipos
limpios en los dos lados y 10 tests del Worker.

Los E2E son 8. En local pasan 7 a la primera; el del registro (`flujoPrincipal.spec.ts`) solo pasa
cuando `next dev` ya ha compilado las páginas. El detalle está en `por-probar.md`.

El PR #52 (tests del Worker, B7 y B8) está en `main`. El PR #53 (F8) está en `develop` y **todavía no
en `main`**.

Cómo probar cada bloque, y los textos de commit y de PR, están en `por-probar.md`.

`docs/pr.md` sigue vacío y sin añadir a git: o lo rellenas o lo borras.

---

## Lo siguiente, en este orden

1. **Probar la rama** siguiendo `por-probar.md`, commitear (un commit por bloque, los mensajes están
   allí) y abrir el PR contra `develop`.
2. **`develop` → `main`**, que lleva F8 y esta rama a producción.
3. **En cuanto Render esté Live, normalizar las alergias del perfil en Atlas**, primero en seco y luego
   con `-- --apply`. Desde el despliegue de F8, un perfil con «gluten» guardado da 400 si su dueño toca
   las preferencias, así que no conviene dejarlo para otro día. Pasos exactos abajo.
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
| F8.1 | Todas las rutas con cuerpo pasan por `validarBody`; ningún controlador importa Zod (en `develop`, #53) |
| F8.2 | Un alérgeno fuera de los 14 da 400 en el perfil y en las preferencias (en `develop`, #53) |
| F8.3 | Los dos `.env.example` cuadran con el código, probado en un clon limpio (en `develop`, #53) |
| F8.4 | El detalle de receta es público, ADR 0001, `/completar-perfil` en el `matcher` (en `develop`, #53) |
| F9.2 | Tests barrera: `validarBody` en toda ruta con cuerpo, nadie fuera de `repositories/` importa modelos, variables de entorno en su plantilla y los 14 alérgenos iguales en cuatro sitios (sin commitear) |
| F9.3 | El Worker entra en el CI (en `main`, #52) |
| F10.2, F10.5 | Índice de `docs/` y ordenar lo que estaba fuera de git |
| F10.3 | Contrato de la API en `referencia/api.md`: 40 endpoints, con un test que lo compara con los routers (sin commitear) |
| F10.4 | Fichas de decisiones 0002 a 0007. Las de F15 y F12.1 esperan a que esas decisiones se tomen (sin commitear) |
| Login y `callbackUrl` | Tras entrar se vuelve a la página de la que se venía, con credenciales, con Google y pasando por `/completar-perfil`. Solo rutas internas (sin commitear) |
| Seguir | `POST /api/usuarios/:id/seguir` tiene tests propios. Dos llamadas a la vez daban 500 y podían dejar la relación a medias; ahora es atómico (sin commitear) |
| B7, B8 | Límite de login por IP real y restos menores |
| UI | UI-001 a UI-010, UI-012 y UI-016 |

### A medias

| Bloque | Qué falta exactamente |
|---|---|
| F7.6 | Las variables de Upstash en Render (ver arriba) |
| F8.2 en Atlas | Pasar `normalizar:alergias` (ver arriba). Después, el `enum` en `usuarioMongo.ts`, que hoy no está a propósito: con datos viejos, cualquier guardado de ese usuario reventaría |
| F9.1 · Tests del dominio | Medido el 4/10: 72,01 % de sentencias y ningún controlador por debajo del 40 % (el más bajo, `subidasController`, 42,85 %). Las cifras del criterio se cumplen, pero la despensa (`despensaRepository`, 20 %) y el chat (`chatService`, 46,91 %) siguen casi sin tests. Falta decidir si se cierra con las cifras o con las cuatro reglas cubiertas; el desglose está en el plan |
| Registro y `callbackUrl` | El destino sobrevive al login, pero no al registro con correo: el enlace «Regístrate gratis» del login no lo arrastra y el correo de verificación tampoco. Quien se registra desde una receta acaba en `/home` |
| E2E del registro en local | `flujoPrincipal.spec.ts` agota sus 5 s por paso mientras `next dev` compila en frío. No se ha tocado; pasa con el servidor caliente, y en el CI va con `next build` y reintentos |
| Pruebas manuales | 44 casillas sin marcar en `pruebas-manuales.md`, entre ellas Google real en producción y el correo a Outlook |
| `REVISION_DESPLIEGUE.md` | El checklist sigue sin marcar, salvo la parte del proxy |

### Sin empezar

| Bloque | Qué es | Coste estimado |
|---|---|---|
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

**Sin actualizar desde el 30 de septiembre.** Lo de abajo es lo que había entonces; las ejecuciones de
los merges del #52 y del #53 no se han mirado.

Las ejecuciones del PR #52 (30/09) estaban **todas en verde**:

| Job | Resultado |
|---|---|
| Backend: typecheck y tests | ✅ |
| Frontend: lint y typecheck | ✅ |
| Tests del Worker (`ci-gemini-proxy`) | ✅, primera vez que corre |
| E2E con Playwright | ✅ en unos 2 min |
| Deploy a Vercel y Render | se salta, como toca en un PR |

La última de `main` sigue siendo la del #50 (run `36599859639`, 29/09), también en verde. Con F8, el
backend tiene que salir con 329 tests en 23 ficheros y el E2E con 5. Cuando entre la rama del 4 de
octubre, con 366 tests en 26 ficheros y 8 E2E: los 2 de siempre, los 3 de `recetaPublica.spec.ts` y
los 3 de `loginCallbackUrl.spec.ts`.

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

Prueba el bloque 1 de `por-probar.md` en el navegador (es lo único que cambia lo que ve un usuario),
commitea, sube la rama hasta `main` y pasa la normalización de alergias en cuanto Render esté Live.
Si sobra rato, Upstash en Render: con eso F7 y F8 quedan cerrados del todo, y lo siguiente gordo ya es
F14, que es lo que desbloquea el producto.
