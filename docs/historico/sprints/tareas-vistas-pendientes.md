# Tareas pendientes — Vistas Sprint 3+

> Estructura de carpetas y barrel exports creados en Sprint 3.
> Componentes reales se implementan cuando el Stitch de cada vista esté aprobado.
> Integración con backend según el sprint indicado en cada sección.

---

## /despensa

### COMPONENTES

- [ ] **HeaderDespensa**
      Texto hero "¡Bienvenido a tu DESPENSA!" — mismo estilo
      tipográfico editorial que SeccionHero de landing page
      (tipografía creativa, palabra DESPENSA en brand/bold)

- [ ] **BarraAnadirIngrediente**
      Input pill sticky + botón "+" circular brand
      Glassmorphism: bg-background/80 backdrop-blur-md

- [ ] **TarjetaIngrediente**
      Imagen circular mock (placeholder warm gradient)
      Nombre bold + cantidad + unidad muted
      Botón editar cantidad inline + botón borrar con Dialog confirmación

- [ ] **ListaIngredientes** — scroll vertical con indicador fade bottom

- [ ] **EstadoVacioDespensa**
      Icono + "Tu despensa está vacía" + CTA "Añadir primer ingrediente"

- [ ] **PopUpAnadirIngrediente** — Drawer/Sheet shadcn
      Input nombre con autocompletado (lista datosIngredientes.ts)
      Input cantidad numérica + Select unidad
      (g · kg · ml · l · tsp · tbsp · cup · unidad · al gusto)
      Botón "Añadir" brand + Botón "Cancelar" outline

### STORE

- [ ] `src/stores/despensaStore.ts` — Zustand
      Estado: ingredientes[], cargando, error
      Acciones: añadir, editar, eliminar, cargar
      Persistencia: zustand/middleware persist (cache local hasta Fase 5)
      Seguir patrón de stores definido en folderStructure.md

### DATOS MOCK

- [ ] `src/features/despensa/data/datosIngredientes.ts`
      30 ingredientes con: id, nombre, imagenUrl mock, unidadPorDefecto

### INTEGRACIÓN FUTURA Fase 5

- [ ] `src/services/despensaService.ts`
- [ ] `src/features/despensa/hooks/useDespensa.ts`

---

## /coleccion (dos pestañas: Mis recetas + Guardadas)

### COMPONENTES

- [ ] **HeaderColeccion**
      Texto hero "¡Tus recetas Favoritas!" mismo estilo editorial
      Subtítulo muted: "X recetas guardadas"

- [ ] **TogglePestanasColeccion**
      Extraer como componente común reutilizable:
      `src/components/common/togglePestanas.tsx`
      Mismo pill segmented control que otras vistas con toggle
      Props: `{ pestanas: string[], activa: string, onChange }`

- [ ] **GridRecetasColeccion**
      2 columnas, tarjetas portrait 3/4 ratio
      REUTILIZAR componentes de cards ya existentes en recetas/
      Pestaña "Mis recetas": cards con ··· menu, sin bookmark
      Pestaña "Guardadas": cards con bookmark icon top-right
      Tap → /recetas/[id]

- [ ] **EstadoVacioMisRecetas**
      Chef hat icon + "Aún no has publicado ninguna receta"
      CTA "Crear receta" → /crear-receta

- [ ] **EstadoVacioGuardadas**
      Bookmark icon + "Aún no has guardado ninguna receta"
      CTA "Explorar recetas" → /discover

- [ ] **IndicadorScroll** — dots o fade bottom

### INTEGRACIÓN FUTURA Fase 5

- [ ] `src/services/recetasService.ts` → `obtenerMisRecetas()`, `obtenerGuardadas()`
- [ ] `src/features/coleccion/hooks/useColeccion.ts`

---

## /perfil (vista de ajustes)

### COMPONENTES

- [ ] **SeccionPerfilAjustes**
      Avatar 80px editable (camera icon overlay) + username + email

- [ ] **FilaAjuste** — componente genérico reutilizable
      Props: `{ icono, label, tipo: 'chevron' | 'toggle' | 'destructivo', onPress }`

- [ ] **GrupoAjustes** — card contenedor con separadores tonales
      bg-card rounded-2xl sin borders duros

- [ ] **TogglePermiso**
      Acceso ubicación / cámara y carpetas / notificaciones
      Usar Notification API y permisos reales del navegador

- [ ] **PopUpCambiarContrasena**
      REUTILIZAR FormularioNuevaContrasena de features/auth/
      Abrir como Dialog shadcn
      Solo visible si usuario.proveedor === 'local' (no Google)

- [ ] **PopUpPreferenciasAlergenos**
      REUTILIZAR SelectorChips + DIETAS_OPCIONES + ALERGENOS_OPCIONES
      de `src/config/opcionesUsuario.ts`
      Misma UI que /completar-perfil
      Abrir como Dialog/Sheet shadcn

- [ ] **FilaCerrarSesion** — texto destructive, sin icono de chevron

- [ ] **BotonesGuardarVolver** — fixed bottom: [← Volver] [Guardar ✓]

- [ ] **TextoVersion** — "Cookr v1.0.0 · TFG · Alejandro Hernández" muted

**NAVBAR:** SÍ — NavBarInferior con icono CircleUserRound activo

### INTEGRACIÓN FUTURA Fase 5

- [ ] `src/services/usuariosService.ts` → `actualizarPerfil()`, `actualizarAjustes()`
- [ ] `src/features/perfil/hooks/usePerfil.ts`

---

## /chat

### COMPONENTES

- [ ] **HeaderChat**
      Flecha ← izquierda + "Cookr IA" bold + "Asistente culinario" muted
      Botón ··· derecha → historial/opciones

- [ ] **HistorialChats**
      Dropdown desplegable desde botón ···
      Lista de conversaciones previas mock con fecha

- [ ] **EstadoVacioChat**
      Icono animado (pulse Framer Motion) + "¿En qué te puedo ayudar?"
      3 chips sugeridos tapeables que pre-rellenan el input:
      "¿Qué cocino hoy?" · "Receta con lo que tengo" · "Dieta sin gluten"

- [ ] **BurbujaMensajeUsuario**
      Alineada derecha, bg-brand text-brand-foreground
      rounded-2xl rounded-br-sm, timestamp muted abajo

- [ ] **BurbujaMensajeIA**
      Alineada izquierda, bg-muted, icono chef pequeño
      Acciones bajo burbuja: [Copiar] [Me gusta]

- [ ] **IndicadorPensando**
      Burbuja izquierda con "Pensando..." + 3 puntos animados
      Framer Motion staggered scale pulse en brand color

- [ ] **MenuAdjuntar**
      Floating card sobre input al pulsar paperclip:
      Foto · Documento · Código de receta
      Desaparece al tocar fuera

- [ ] **BarraInputChat** — FIJA bottom (reemplaza navbar en esta vista)
      [📎 paperclip] + [input pill expandible max 4 líneas]
      + [→ send button brand filled circle]
      "+" quick actions arriba del input
      bg-background/90 backdrop-blur-md

**SIN NAVBAR** — BarraInputChat sustituye a NavBarInferior

### STORE

- [ ] `src/stores/chatStore.ts` — Zustand
      Estado: mensajes[], conversacionActiva, cargando
      Acciones: enviarMensaje, limpiarChat, cargarHistorial

### DATOS MOCK

- [ ] `src/features/chat/data/datosChat.ts`
      Respuestas mock IA + función `getMockRespuesta(mensaje): string`

### INTEGRACIÓN FUTURA Fase 6

- [ ] `src/services/chatService.ts` → `POST /api/chat` (Gemini)
- [ ] Contexto despensa: enviar alérgenos + items del despensaStore al prompt

---

## /discover

> **NOTA:** BuscadorFiltros ya existe en components/common/ — reutilizar.
> TogglePestanas extraído en /coleccion — reutilizar.

### COMPONENTES PENDIENTES

- [ ] **HeaderDiscover** — sticky con BuscadorFiltros + chips categoría

- [ ] **FeedTrending** — feed global recetas populares
      REUTILIZAR TarjetaPost del home

- [ ] **BannerEventoTematico** — card hero destacada para eventos activos
      ej: "Mes de la Repostería" — imagen fondo + título + descripción

- [ ] **EstadoVacioTrending**

### INTEGRACIÓN FUTURA Fase 5

- [ ] `recetasService.obtenerTrending()`
- [ ] `recetasService.obtenerEventos()`
