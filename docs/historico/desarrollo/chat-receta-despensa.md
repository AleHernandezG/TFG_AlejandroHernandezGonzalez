# Chat — "Receta con lo que tengo"

## Qué hace

El chip **"Receta con lo que tengo"** del asistente ya no manda un texto genérico a Gemini. Ahora:

1. Lee la despensa del usuario y su perfil (alergias y preferencias).
2. Busca en la base de datos una receta que contenga **todos** los ingredientes de la despensa, descartando las que choquen con sus alergias y priorizando las que encajan con sus gustos.
3. Si no hay ninguna receta que use todo, cae a Gemini con un prompt que incluye los ingredientes, las alergias y las preferencias, pidiéndole una receta a medida que respete las restricciones.

La idea: si tienes la receta en casa (en la BBDD), te la enseñamos directa con enlace; si no, la IA improvisa una sin saltarse tus alergias.

---

## Archivos modificados

| Archivo | Capa | Cambio |
|---|---|---|
| `backend/src/repositories/recetaRepository.ts` | Repository | Nuevo `buscarCandidatasParaDespensa(alergias)` + tipo `RecetaCandidataDespensa` |
| `backend/src/services/chatService.ts` | Service | `recetaConDespensa(usuarioId)` + matching de ingredientes + fallback Gemini |
| `backend/src/routes/chat.routes.ts` | Routes | Nuevo `POST /api/chat/receta-despensa` |
| `frontend/src/services/chatService.ts` | Service FE | `recetaConDespensa(token)` |
| `frontend/src/stores/chatStore.ts` | Store | Acción `recetaConDespensa()` |
| `frontend/src/features/chat/components/contenidoChat.tsx` | Componente | `handleChip()` enruta por id del chip |
| `frontend/src/features/chat/components/estadoVacioChat.tsx` | Componente | `onChipClick` recibe el chip completo |
| `frontend/src/features/chat/components/burbujaIA.tsx` | Componente | Markdown renderiza enlaces (`<a>`) con estilo de marca |
| `frontend/src/features/chat/data/datosChat.ts` | Data | Eliminado el mock muerto `RESPUESTAS_MOCK` / `getMockRespuesta` |

---

## Flujo

```
Click chip "Receta con lo que tengo"
  ↓ contenidoChat.handleChip(chip)  →  chip.id === 'receta-ingredientes'
chatStore.recetaConDespensa()
  ↓ POST /api/chat/receta-despensa  (Bearer token)
chatService.recetaConDespensa(usuarioId)
  ↓
  1. obtenerDespensa() + buscarPerfilPorId()  (en paralelo)
  2. ¿Despensa vacía? → fuente "sin-despensa" (mensaje guía)
  3. buscarCandidatasParaDespensa(alergias)   → recetas alérgeno-safe
  4. elegirMejorReceta()                       → ¿alguna contiene TODO?
       sí → fuente "bbdd"   (receta + markdown con enlace)
       no → sugerirRecetaConGemini()  → fuente "gemini"
  ↓
{ respuesta, fuente, receta? }  →  burbuja de IA en el chat
```

---

## Algoritmo de selección

### Filtro duro: alérgenos

La query a Mongo ya descarta cualquier receta cuyo array `alergenos` contenga alguna de las alergias del usuario (`{ alergenos: { $nin: alergias } }`). Es seguridad, no preferencia: nunca se salta.

### Match de ingredientes

Una receta es candidata completa si **cada** ingrediente de la despensa aparece en la receta. La comparación normaliza tildes y mayúsculas, y es tolerante:

| Caso | Regla |
|---|---|
| Ingrediente de ≥ 4 letras | match por substring en ambos sentidos (`"tomate"` ↔ `"tomate triturado"`) |
| Ingrediente corto (< 4 letras) | match por token exacto, para no sobre-emparejar (`"ajo"`) |

### Desempate: gustos + popularidad

Entre las recetas que contienen todo, se ordena por:

1. Nº de categorías que coinciden con las preferencias del usuario (desc).
2. Nº de likes (desc).

Las preferencias son un *plus* para rankear, no un filtro: si encajan, suben; si no, la receta sigue siendo válida (ya tienes los ingredientes).

### Fallback a Gemini

Si ninguna receta de la BBDD usa todos los ingredientes, se construye un prompt con la despensa completa, las alergias (marcadas como innegociables) y las preferencias, y Gemini propone una receta. Reutiliza el mismo modelo y el `thinkingBudget: 0` del resto del chat. Si Gemini no está configurado, devuelve un mensaje honesto en vez de fallar.

---

## Contrato de la API

`POST /api/chat/receta-despensa` · requiere auth · rate limit 30/usuario (igual que `/chat`)

Request: sin body.

Response `200`:

```json
{
  "respuesta": "markdown con la sugerencia",
  "fuente": "bbdd | gemini | sin-despensa",
  "receta": { "id": "...", "titulo": "...", "imagenUrl": "..." }
}
```

`receta` solo viene cuando `fuente === "bbdd"`. El frontend pinta `respuesta` como burbuja de IA; el markdown de la rama `bbdd` incluye un enlace `/recetas/{id}` clicable.

---

## Decisiones de diseño

- **Alérgenos en la query, gustos en memoria:** lo crítico (alergias) se filtra en Mongo; lo opcional (preferencias) se usa para ordenar en JS sobre el conjunto ya reducido.
- **"Contiene todos" y no "el que más tenga":** es lo que pidió el caso de uso. Si se relajara a "máximo solapamiento" casi nunca caería al fallback de Gemini. Si en el futuro se quiere un punto medio, el sitio para tocarlo es `elegirMejorReceta()`.
- **Endpoint propio, no un mensaje de chat:** así el backend tiene el contexto del usuario (despensa, perfil) sin depender de lo que escriba, y el front no tiene que mandar datos sensibles en el cuerpo del mensaje.
- **Matching tolerante a propósito:** la despensa guarda nombres libres ("Tomate") y las recetas nombres descriptivos ("Tomate triturado"). El substring bidireccional cubre ese desfase sin necesidad de un catálogo de ingredientes normalizado.
