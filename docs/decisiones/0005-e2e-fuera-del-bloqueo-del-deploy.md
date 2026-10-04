# 0005 · Los E2E corren en el CI pero no bloquean el despliegue

**Fecha:** escrita el 4 de octubre de 2026; la decisión es del 17 de julio de 2026, cuando entraron los E2E · **Estado:** aceptada · **Origen:** F10.4 del plan, apartado de tests de `CLAUDE.md`

## Contexto

El workflow de GitHub Actions despliega el backend a Render con un job `deploy`. Ese job depende de
`ci-backend`, que pasa lint, tipos y los tests unitarios: un test unitario en rojo no deja
desplegar.

Los E2E de Playwright levantan dos servidores, un Mongo efímero y un navegador. Son más lentos y
fallan a veces sin que el código esté mal.

## Decisión

El job `e2e` corre en cada push y en cada PR a `main` y `develop`, sube el informe HTML si falla, y
**no** está en el `needs` de `deploy`, que es `[ci-frontend, ci-backend]`. Un E2E en rojo se ve, pero no impide desplegar.

`ci-gemini-proxy` tampoco está en ese `needs`, por otro motivo: el Worker se despliega a mano.

## Alternativa descartada

Meter `e2e` en el `needs` de `deploy`, igual que los unitarios. Se descarta porque los E2E son
*flaky*, y un E2E inestable no debe cortar un *hotfix*.

No es para siempre. Lo que está escrito en `/cookr-tests` es que, si el job aguanta en verde una
temporada, se promueve a bloqueante añadiéndolo a ese `needs`. No hay fijado cuánto es una
temporada.

## Consecuencias

- Una regresión de verdad en el registro, el login o el alta de receta puede llegar a producción con
  el job `e2e` en rojo. La barrera es que alguien mire el resultado.
- Un job que puede fallar sin consecuencias se acaba ignorando. Si eso pasa, los E2E dejan de servir
  aunque sigan corriendo.
- Vercel despliega el frontend por su integración con Git, al margen del workflow. Así que para el
  frontend ni siquiera los unitarios del backend bloquean nada; los E2E son la única prueba
  automática que lo ejercita, y es justo la que no bloquea.
- La inestabilidad se ha visto otra vez el 4 de octubre: en local, el primer test de la tanda
  (`flujoPrincipal.spec.ts`, el registro) agota sus 5 segundos mientras `next dev` compila en frío,
  y pasa cuando el servidor ya está caliente. En el CI se compila antes con `next build` y hay
  reintentos.
