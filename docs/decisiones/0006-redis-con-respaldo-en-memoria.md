# 0006 · Redis si está configurado, memoria si no

**Fecha:** escrita el 4 de octubre de 2026; la parte de IA es de F7.6, 5 de septiembre de 2026, y la de los limitadores es anterior · **Estado:** aceptada · **Origen:** F10.4 del plan, `CLAUDE.md` («Trampas conocidas») y `cambios/f7-rendimiento.md` (PERF-005)

## Contexto

El backend guarda estado que no es de Mongo: los contadores de los limitadores (login, registro,
IA), el tope diario de llamadas a Gemini y tres cachés de IA. Todo vivía en variables del proceso.
Render reinicia el contenedor al desplegar y al despertar del sueño del plan gratuito, así que el
contador de Gemini volvía a cero varias veces al día y el tope de 1000 no protegía de nada.

## Decisión

Dos almacenes con el mismo criterio, `lib/rateLimitStore.ts` para los limitadores y
`lib/almacenIA.ts` para el tope y las cachés: **Upstash Redis si `UPSTASH_REDIS_URL` y
`UPSTASH_REDIS_TOKEN` están definidas, memoria si no.** El código elige solo.

En el almacén de IA, si Redis está configurado pero se cae, la llamada pasa: el almacén en memoria
sigue debajo y recoge lo que Redis no pudo. El aviso se imprime una sola vez.

## Alternativa descartada

Exigir Redis: no arrancar sin las variables, o bloquear la llamada cuando Redis no responde. Para el
almacén de IA el motivo está escrito en F7.6: bloquear protege la factura, pero rompe la función
principal de la aplicación por un fallo de infraestructura ajena. Con la memoria debajo, una caída
degrada al comportamiento de antes de F7.6, no a «sin tope».

Para el store de los limitadores, el motivo del respaldo en memoria **no está escrito** en
`CLAUDE.md` ni en `docs/cambios/`; solo consta que funciona así. Lo que sí se ve en el código es que
los tests y el desarrollo en local corren sin Redis gracias a ese respaldo.

## Consecuencias

- Sin las dos variables, no cambia nada y nada falla: el backend funciona igual que antes, con los
  contadores en memoria. Es justo lo que pasa hoy en producción, donde todavía no están puestas en
  Render (`estado/pendientes.md`). La decisión está tomada y el código hecho, pero su efecto no ha
  llegado.
- Olvidarse las variables no da ningún error que lo delate. Es el precio de que el respaldo sea
  silencioso.
- El respaldo en memoria se reinicia en cada redeploy y no se comparte entre instancias. Con una
  sola instancia lo segundo no se nota; con dos, cada una contaría por su cuenta.
- Una caída de Redis afloja el tope de Gemini sin que nadie se entere más que por una línea de log.
- Ese respaldo ante caídas es solo del almacén de IA. En los limitadores, la elección entre Redis y
  memoria se hace una vez, al arrancar (`crearStore`), y `UpstashStore` no captura un fallo de Redis.
  Qué responden el login o el registro con Upstash configurado y caído no está probado.
- El camino de Redis solo se prueba con un cliente simulado (`tests/almacenIA.redis.test.ts`,
  `tests/upstashStore.test.ts`). Que el contador sobreviva a un redeploy de verdad sigue sin
  comprobarse; está en `estado/pruebas-manuales.md`.
- `reiniciarLimitesAuth()` y `reiniciarAlmacenIA()` existen por los tests, que comparten ese estado
  en memoria. No se sustituyen por un `skip` con variable de entorno.
