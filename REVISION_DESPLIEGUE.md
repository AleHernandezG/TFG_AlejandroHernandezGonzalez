# Revisión de la versión desplegada

Checklist para comprobar a mano, en producción (Vercel + Render), los cambios que salen al mergear `develop` en `main`. Marca cada punto cuando lo verifiques.

**Contexto:** el merge lleva a producción 9 commits que hasta ahora solo vivían en `develop`. Los siete de la sesión del 17/07/2026 (tests, arreglos de la Fase 2b y E2E) más dos anteriores que tampoco se habían desplegado (rate limiting por IP del login y documentación). Lo que sigue solo lista lo que cambia **de cara al usuario**; los tests y el CI no se ven en la app.

## Antes de empezar

- [ ] El CI de `develop` tiene que estar en verde en la pestaña **Actions** antes de mergear. Fíjate sobre todo en el job **`e2e`**, que es nuevo y nunca ha corrido en un runner de GitHub. Si sale rojo, no bloquea el deploy (está fuera del `needs`), pero conviene arreglarlo antes de que toque `main`.
- [ ] Después del merge a `main`, espera a que Render termine el redeploy (el plan gratuito tarda un poco en despertar) y a que Vercel publique el frontend. Comprueba `GET /api/health` del backend antes de probar nada.
- [ ] Ten a mano una cuenta cuyo **perfil tenga al menos un alérgeno** (por ejemplo, huevo). Si no la tienes, entra en tu perfil y añádelo. Sin esto no puedes probar lo más importante.
- [ ] Si ya tenías sesión abierta de antes, haz una recarga forzada (Ctrl+F5). El feed se cachea en el cliente (TanStack Query) y podrías ver datos viejos.

## 1. Filtro de alérgenos del perfil (lo crítico)

Es un requisito de salud, no una preferencia. Antes de este cambio, un usuario con alérgenos en el perfil los veía igual en el feed.

- [ ] Con la cuenta que tiene huevo en el perfil, abre **home**. No debe aparecer ninguna receta que contenga huevo, sin que hayas tocado ningún filtro.
- [ ] Lo mismo en **discover**.
- [ ] Abre el **drawer de filtros**. Los alérgenos del perfil salen marcados, en rojo, con un candado y deshabilitados (no se pueden desmarcar). Hay una nota con enlace a tu perfil.
- [ ] En ese mismo drawer, marca **otro** alérgeno distinto (por ejemplo, lácteos) y aplica. Ahora no deben salir ni recetas con huevo ni con lácteos. El drawer suma, no sustituye.
- [ ] Entra en el **detalle de una receta** y baja al carrusel de "recetas parecidas". Tampoco debe colar ninguna con tu alérgeno del perfil.
- [ ] Comprobación de que no se ha roto lo de siempre: con una cuenta **sin alérgenos** en el perfil, el feed sale completo, como antes.

Aviso esperado, no es un fallo: cualquier usuario con alérgenos en el perfil verá **menos recetas** que antes. Es justo el arreglo.

## 2. Dieta y categoría a la vez (discover)

Antes, combinar dieta y categoría hacía que una pisara a la otra y salían recetas que no cumplían la dieta.

- [ ] En discover, filtra por una **dieta** (por ejemplo, vegano) y una **categoría** (por ejemplo, postre) a la vez. Los resultados deben cumplir **las dos** condiciones: solo postres veganos, ningún postre con huevo o leche.
- [ ] Filtra solo por la dieta: debe seguir funcionando como siempre.
- [ ] Filtra solo por la categoría: igual.

## 3. Correo con espacios (menor)

Antes, un correo con un espacio al final se rechazaba con "Correo no válido" en vez de limpiarse.

- [ ] En **registro** o en **login**, escribe tu correo con un espacio al final (o al principio) y envía. Debe aceptarlo (lo recorta), no rechazarlo. Afecta también a recuperar contraseña y reenviar verificación, pero con probar una de las cuatro puertas basta.

## 4. Rate limiting del login (venía de antes, se despliega ahora)

Esto ya estaba en `develop` desde la Fase 1 pero no había llegado a producción.

- [ ] Falla el login a propósito varias veces seguidas con una contraseña incorrecta. A partir del intento 10 en 15 minutos debe cortar con un mensaje de demasiados intentos. Un login correcto **no** cuenta para el límite, así que no te autobloqueas por entrar bien varias veces.
- [ ] Ojo con esto en el primer deploy: el backend confía en un único salto de proxy (`trust proxy = 1`). Si al probar el rate limiting el corte llega a todos los usuarios a la vez, o no llega nunca, es señal de que Render mete más de un proxy por delante y hay que revisarlo. Está anotado en la Fase 1 de `PLAN_AUDITORIA.md`.

## Qué NO hace falta revisar

- Los tests unitarios y el E2E: se ejecutan en CI, no cambian nada de la app en sí.
- El flujo de correo real (Mailjet): no se ha tocado en esta tanda. Sigue con el aviso de siempre sobre SPF/DKIM y el dominio, que es la Fase 3.

## Cuando termines

Confírmame qué puntos han salido bien y cuáles no. Si algo falla, dime qué esperabas y qué viste, y lo miro antes de seguir con las Fases 4 y 5.
