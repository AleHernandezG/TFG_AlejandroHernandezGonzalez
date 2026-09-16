# Sinergias y Reutilización de Proyectos (`Desktop/Proyectos`)

> Análisis exhaustivo de los proyectos ubicados en `C:\Users\usuario\Desktop\Proyectos` para extraer módulos, algoritmos, bases de datos y patrones reutilizables en **Cookr**.

---

## 1. Mapa de Proyectos Analizados

```
C:\Users\usuario\Desktop\Proyectos\
├── DietMetric/           Motor de cálculo nutricional, catálogo de 973 alimentos y ADRs
├── TODO-Recetas-Movil/   Lista de compra colaborativa en tiempo real (React Native / Supabase)
├── PokePaella/           Motor de dominio en TS puro, Zustand, algoritmos de scoring y simulación
├── WHA/                  Compilador de reglas en tiempo real, Canvas/Konva y lecciones paso a paso
└── WebPokeBasica/        API Express y cliente Vite para catálogos
```

---

## 2. Análisis Detallado y Aplicación Directa en Cookr

### 🥗 1. DietMetric (`Desktop/Proyectos/DietMetric`)
*Aplicación de planificación dietética profesional y motor de cálculo clínico (Tauri + React + TypeScript + SQLite).*

* **Componentes clave analizados:**
  - **Catálogo de 973 alimentos:** Base de datos completa (`herramientas/etl/`) con 64 columnas nutricionales por alimento (macronutrientes, micronutrientes, índices glucémicos y alérgenos).
  - **Motor de cálculo energético:** Ecuaciones de gasto energético basal (REE, fórmulas IOM/DRI, Mifflin-St Jeor) y gasto por actividad física (`tecnica/REGLAS-NEGOCIO.md`).
  - **Suite de paridad y tests:** Pruebas rigurosas con Vitest para validar que las fórmulas no pierden decimales.
* **Qué aprovechamos en Cookr:**
  1. **Planificador Semanal Nutricional:** Reutilizar las fórmulas de cálculo de balance calórico y macronutrientes de DietMetric para calcular los totales diarios/semanales en Cookr de forma local y exacta, sin consumir cuotas de APIs externas (Edamam/USDA).
  2. **Catálogo Semilla de Alimentos:** Poblar la despensa e ingredientes de Cookr con los nombres, alérgenos y densidades nutricionales ya normalizados en español.

---

### 🛒 2. TODO-Recetas-Movil (`Desktop/Proyectos/TODO-Recetas-Movil`)
*App de lista de la compra colaborativa compartida en tiempo real (Expo SDK 54 + TypeScript + Supabase + TanStack Query Persist).*

* **Componentes clave analizados:**
  - **Sincronización en Tiempo Real:** Lista compartida entre múltiples usuarios mediante código de invitación de 6 caracteres sin requerir login forzado.
  - **Persistencia Offline y Caché:** Integración de `@tanstack/query-async-storage-persister` con NetInfo para funcionamiento continuo sin conexión a internet.
  - **Gestión de ítems de compra:** Estados de artículos (comprados/pendientes), categorización automática por pasillos y tachado interactivo.
* **Qué aprovechamos en Cookr:**
  1. **Módulo de Lista de la Compra Colaborativa:** Trasladar la estructura de datos, lógica de estados y flujo de invitación por código para la funcionalidad de **Despensa / Hogar Compartido**.
  2. **Estrategia Offline para la PWA:** Reutilizar el patrón de persistencia de TanStack Query para que la lista de la compra y las recetas guardadas se puedan consultar y tachar en el supermercado sin cobertura.
  3. **Exportación y Formato:** Estructura para agrupar ingredientes por categoría de supermercado.

---

### 🎮 3. PokePaella (`Desktop/Proyectos/PokePaella`)
*Motor web con separación estricta por capas (`domain/` puro en TypeScript sin React ni DOM), gestión de estado con Zustand y pruebas en Node.*

* **Componentes clave analizados:**
  - **Dominio Desacoplado:** Toda la lógica algorítmica vive en TypeScript puro y corre en Vitest en 2 segundos.
  - **Algoritmos de Afinidad y Scoring:** Mecanismo de ponderación por reglas, estadísticas base y modificadores contextuales.
  - **Estado Atómico con Zustand:** Manejo limpio de estados interactivos y persistencia en `localStorageStore`.
* **Qué aprovechamos en Cookr:**
  1. **Motor de Recomendación Inteligente Híbrido:** Implementar el algoritmo de afinidad de recetas en un módulo de dominio puro en TypeScript (desacoplado de la UI), evaluando la intersección de ingredientes en despensa, preferencias del perfil y pesos de interacción ("me gusta" / guardados).
  2. **Gestión de Estado del Modo Cocina:** Utilizar Zustand para controlar el paso actual, temporizadores activos concurrentes y síntesis de voz en el asistente de cocina.

---

### 🪄 4. WHA — Witch Hat Atelier (`Desktop/Proyectos/WHA`)
*Compilador de sellos interactivo con Canvas/Konva, validación de reglas en vivo y tutorial paso a paso.*

* **Componentes clave analizados:**
  - **Modo Asistido Paso a Paso:** Interfaz guiada tipo lección interactiva con feedback visual de progreso.
  - **Generación Visual en Canvas:** Renderizado dinámico de elementos gráficos listos para exportar como imagen.
* **Qué aprovechamos en Cookr:**
  1. **Modo Cocina Manos Libres (Step-by-Step UI):** Trasladar el patrón de interfaz para la vista de cocina paso a paso con fuentes grandes y detección visual de instrucciones.
  2. **Generador de Tarjetas de Receta para Redes:** Crear un generador de fichas visuales de receta en formato tarjeta (Story / Post) con código QR usando Canvas.

---

## 3. Matriz de Reutilización Directa para Cookr

| Funcionalidad en Cookr | Proyecto Origen | Archivos / Lógica Reutilizable | Beneficio Inmediato |
|---|---|---|---|
| **Menú Semanal & Balance Macros** | `DietMetric` | `tecnica/REGLAS-NEGOCIO.md`, fórmulas REE/IOM | Cálculo exacto y local sin coste de APIs |
| **Catálogo de Alimentos Despensa** | `DietMetric` | `herramientas/etl/`, tablas de alimentos | 973 alimentos normalizados en español |
| **Lista de Compra & Despensa Hogar** | `TODO-Recetas-Movil` | `src/`, modelo de lista compartida, código invitación | Lista colaborativa en tiempo real lista |
| **PWA & Modo Offline** | `TODO-Recetas-Movil` | Configuración TanStack Persist & NetInfo | Funciona en el supermercado sin red |
| **Recomendación Inteligente** | `PokePaella` | Patrón `domain/` puro + cálculo de score | Tests ultrarrápidos y lógica limpia |
| **Modo Cocina & Tarjetas Visuales** | `WHA` / `PokePaella` | Store Zustand + UI de lecciones paso a paso | Experiencia de usuario interactiva |

---

## 4. Registro y Enlaces

Este documento queda integrado en el repositorio oficial en:  
👉 **[docs/referencia/sinergias-proyectos.md](file:///c:/Users/usuario/Desktop/Asuntos%20Generales/4%20Curso/TFG_AlejandroHernandezGonzalez/docs/referencia/sinergias-proyectos.md)**
