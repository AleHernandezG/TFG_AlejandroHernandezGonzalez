# Deuda Técnica — TFG Gastronómica
# Última actualización: 2026-03-21
#
# Registro de deudas técnicas conocidas: qué son, por qué no se resuelven ahora
# y cuándo/cómo abordarlas. Adjunta este fichero cuando quieras resolver alguna.
# ─────────────────────────────────────────────────────────────────────────────

## [DEBT-001] Paquetes deprecated en npm install

**Estado:** ⏳ Aplazado — registrado 2026-03-21
**Cuándo resolver:** Fase 6 (deploy) o al actualizar Next.js a v15

### Síntoma

Al ejecutar `npm install` en `/frontend` aparecen ~15 warnings de deprecated:

```
npm warn deprecated inflight@1.0.6
npm warn deprecated rimraf@3.0.2 / rimraf@2.7.1
npm warn deprecated glob@7.2.3 (x3) / glob@10.3.10
npm warn deprecated rollup-plugin-terser@7.0.2
npm warn deprecated sourcemap-codec@1.4.8
npm warn deprecated @humanwhocodes/config-array@0.13.0
npm warn deprecated @humanwhocodes/object-schema@2.0.3
npm warn deprecated workbox-google-analytics@6.6.0
npm warn deprecated workbox-cacheable-response@6.6.0
npm warn deprecated source-map@0.8.0-beta.0
npm warn deprecated node-domexception@1.0.0
npm warn deprecated eslint@8.57.1
```

### Análisis: por qué NO actualizar ahora

Todos los warnings caen en una de tres categorías:

#### Categoría A — Transitivas (no controlables directamente)
`inflight`, `rimraf@2/3`, `glob@7/10`, `rollup-plugin-terser`, `sourcemap-codec`,
`source-map`, `node-domexception`, `@humanwhocodes/config-array`, `@humanwhocodes/object-schema`

Son dependencias de **dependencias de nuestros paquetes**, no de nuestro `package.json`.
No se pueden actualizar sin que el paquete padre las actualice primero.
No hay ninguna acción directa posible. **Ignorar.**

#### Categoría B — eslint@8 (bloqueado por framework)
`eslint@8.57.1` está en `devDependencies` como `"eslint": "^8"` y lo fija
`eslint-config-next@14.2.35`, que solo soporta ESLint v8.

Para pasar a ESLint v9 habría que:
1. Migrar Next.js de v14 → v15 (cambio de App Router API, posibles breaking changes)
2. Actualizar `eslint-config-next` a v15
3. Migrar el fichero de configuración de `.eslintrc` a `eslint.config.js` (flat config)

Este conjunto de cambios **no compensa el riesgo** en las fases de feature development
(Fases 1-5). Es trabajo de infraestructura que pertenece a la Fase 6 de deploy.

#### Categoría C — next-pwa@5.6.0 (deprecado pero funcional)
`workbox-google-analytics` y `workbox-cacheable-response` son transitivas de `next-pwa@5.6.0`.
`next-pwa v5` está deprecado; el sucesor es `@ducanh2912/next-pwa` o `@serwist/next`.

El paquete **funciona correctamente** — las advertencias son de Workbox Google Analytics
(que el proyecto no usa) y de cacheable-response internamente. No hay impacto funcional
ni de seguridad conocido.

La migración implica cambios en `next.config.js` y tests de PWA, que corresponden a
la **Fase 6 (deploy + PWA setup)**.

### Impacto actual

| Categoría | Riesgo de seguridad | Impacto en desarrollo | Impacto en build |
|-----------|--------------------|-----------------------|-----------------|
| Transitivas | Ninguno conocido | Ninguno | Ninguno |
| eslint@8 | Ninguno | Ninguno | Ninguno |
| next-pwa | Ninguno conocido | Ninguno | Ninguno |

**Los warnings son informativos. No bloquean desarrollo, lint, build ni tests.**

### Cuándo y cómo resolver

#### DEBT-001-A: eslint@8 → eslint@9
**Cuándo:** Fase 6 — antes del primer deploy a Vercel
**Cómo:**
```bash
# 1. Actualizar Next.js
cd frontend
npm install next@15 eslint@9 eslint-config-next@15

# 2. Migrar configuración de ESLint
# Renombrar .eslintrc.json → eslint.config.js
# Usar formato flat config (ver docs Next.js 15)

# 3. Verificar que lint sigue funcionando
npm run lint
```
**Documentación:** https://nextjs.org/docs/app/building-your-application/configuring/eslint

---

#### DEBT-001-B: next-pwa@5 → @ducanh2912/next-pwa
**Cuándo:** Fase 6 — al configurar PWA para producción en Vercel
**Cómo:**
```bash
# 1. Desinstalar versión deprecada
npm uninstall next-pwa

# 2. Instalar sucesor
npm install @ducanh2912/next-pwa

# 3. Actualizar next.config.js
# De:
#   const withPWA = require('next-pwa')({ ... })
# A:
#   const withPWA = require('@ducanh2912/next-pwa').default({ ... })
```
**Documentación:** https://ducanh2912.github.io/next-pwa

---

#### DEBT-001-C: Transitivas
**Cuándo:** Se resolverán solas al actualizar Next.js / eslint en los pasos anteriores.
No requieren acción directa. Reevaluar en Fase 6 si siguen apareciendo.

### Referencias
- Revisado en sesión 2026-03-21 antes de continuar con Fase 1 (Auth)
- Decisión: aplazar todo a Fase 6, no bloquea roadmap actual
