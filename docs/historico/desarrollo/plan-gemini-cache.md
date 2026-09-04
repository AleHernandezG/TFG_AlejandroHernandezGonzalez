# Plan — Caché en memoria para llamadas a Gemini

## Objetivo

Reducir las llamadas redundantes a MongoDB y la instanciación repetida del cliente Gemini, sin infraestructura adicional (sin Redis, sin cambios de schema).

---

## Problemas identificados

| Problema | Impacto | Frecuencia |
|---|---|---|
| `obtenerContextoUsuario()` hace 2 queries a MongoDB por mensaje de chat | 2 roundtrips Atlas en cada mensaje | Cada vez que el usuario envía un mensaje |
| `new GoogleGenerativeAI(apiKey)` se instancia en cada request | Overhead de inicialización del cliente | Cada llamada a responderChat, generarRecetaDesdeTexto, escanearTicket |
| `generarRecetaDesdeTexto` sin protección ante doble-submit | Llama a Gemini 2 veces con idéntico prompt | Raro pero ocurre con doble-click o doble-submit |

---

## Solución — tres cachés en memoria

### Caché 1: Contexto de usuario (mayor impacto)

```
Map<usuarioId, { contexto: string, expira: number }>
TTL: 5 minutos
Máximo: 100 entradas (limpieza de expirados si se supera)
```

- En `responderChat()` se llama antes de las queries a MongoDB
- Si hay entrada válida → devuelve el string cacheado, 0 queries
- Si expiró o no existe → llama a `obtenerContextoUsuario()` y guarda
- TTL de 5 min: suficiente para una sesión de chat fluida; si el usuario actualiza su despensa, el contexto se refresca solo

### Caché 2: Singleton del cliente Gemini

```
let _genAI: GoogleGenerativeAI | null = null
function obtenerCliente(): GoogleGenerativeAI
```

- Se inicializa la primera vez que se llama
- Las siguientes peticiones reusan la misma instancia
- El `model` con `systemInstruction` no se puede cachear (varía por usuario), pero el cliente base sí

### Caché 3: Generación de receta desde texto

```
Map<descripcionNormalizada, { resultado: unknown, expira: number }>
TTL: 2 minutos
```

- Key: texto normalizado (`trim().toLowerCase().replace(/\s+/g, ' ')`)
- Protege ante doble-submit en el mismo formulario
- TTL corto: 2 minutos — solo para absorber el tiempo entre el primer click y un posible segundo

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/src/services/chatService.ts` | Tres cachés en memoria + helper `obtenerCliente()` + `invalidarContextoUsuario()` exportada |

---

## Función de invalidación

```ts
export function invalidarContextoUsuario(usuarioId: string): void
```

Exportada para que los repositorios que modifican perfil o despensa puedan invalidar el caché manualmente si se necesita en el futuro. En la implementación actual no se llama desde ningún sitio (el TTL es suficiente para el TFG), pero la interfaz queda disponible.

---

## Lo que NO cambia

- Ningún schema de MongoDB
- Ninguna dependencia nueva
- El comportamiento externo de las tres funciones exportadas es idéntico
- `escanearTicket()` no se cachea: las imágenes son siempre únicas
