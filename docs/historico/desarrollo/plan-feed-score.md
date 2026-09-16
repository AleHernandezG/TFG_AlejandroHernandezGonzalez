# Plan — Algoritmo de scoring para el feed de Discover

## Objetivo

Sustituir el ordenamiento plano del feed de Discover (fecha o likes en bruto) por un score híbrido que combina popularidad, decaimiento temporal y relevancia personal, sin infraestructura adicional.

---

## Archivos modificados

| Archivo | Capa | Cambio |
|---|---|---|
| `backend/src/types/receta.ts` | Types | Añadir `'score'` a `FiltrosFeed.sort` |
| `backend/src/repositories/recetaRepository.ts` | Repository | Nueva rama de sorting + función de score + helper preferencias |
| `frontend/src/features/discover/hooks/useDiscover.ts` | Hook FE | Mapear tab `recientes` → `sort: 'score'` en lugar de `'reciente'` |

---

## Fórmula de scoring

```
score = (likes × 2 + comentarios × 3) × decay + followBoost + prefBoost
```

### Variables

| Variable | Cálculo | Justificación |
|---|---|---|
| `popularity` | `likes×2 + comentarios×3` | Comentar requiere más intención que un like |
| `decay` | `1 / (1 + √daysOld)` | Curva suave: hoy=1.0 · 7d≈0.27 · 30d≈0.15 · 90d≈0.09 |
| `followBoost` | `+1.5 si sigues al autor` | Bonus pequeño para mantener cercanía social |
| `prefBoost` | `+0.5 × categorías coincidentes` | Si la receta es "vegana" y el usuario tiene esa preferencia |

### Curva decay a lo largo del tiempo

| Días desde publicación | Decay |
|---|---|
| 0 | 1.00 |
| 1 | 0.50 |
| 7 | 0.27 |
| 30 | 0.15 |
| 90 | 0.09 |

---

## Flujo de datos

```
GET /api/recetas?sort=score
  ↓
recetasController → recetasService.obtenerFeed()
  ↓
recetaRepository.findAll({ sort: 'score', ... })
  ↓ (nueva rama)
  1. Fetch docs + usuarioId → obtenerPreferenciasUsuario()
  2. calcularScoreFeed() por cada doc
  3. sort() en memoria por score desc
  4. slice() para paginar
  ↓
docAPostFeed() → PostFeedRespuesta[]
```

---

## Decisiones de diseño

- **Sin schema changes:** las "guardadas" de una receta están en `usuario.recetasGuardadas`, no en el documento de receta. Para no migrar el schema, el score usa solo `likes` y `listaComentarios` (ambos en la receta).
- **In-memory sort:** igual que el `sort === 'likes'` existente. Válido para la escala del TFG.
- **Tab "Recientes" → score:** el tab `recientes` pasa de `sort: 'reciente'` a `sort: 'score'`. El algoritmo ya premia la recencia vía decay, así que "recientes" no pierde su semántica.
- **Tab "Mejor valorados" → sin cambios:** sigue usando `sort: 'likes'` — muestra el ranking puro de likes, sin decaimiento.

---

## Compatibilidad

- El feed de `/home` (`feedHome.tsx`, `useRecetasFeed`) no se toca: sigue usando `sort: 'reciente'` o `sort: 'likes'`.
- El endpoint `GET /api/recetas` acepta el nuevo valor `sort=score` de forma retrocompatible (los demás valores siguen funcionando igual).
