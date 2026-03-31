# Stitch by Google — Guía de uso para Cookr

## ¿Qué es Stitch?

Stitch by Google (stitch.withgoogle.com) es una herramienta de IA que genera
diseños de interfaz a partir de descripciones o wireframes. Se usa en Cookr
como referencia visual obligatoria antes de implementar cada vista FE.

---

## Flujo obligatorio — antes de cada vista FE

1. Ir a **stitch.withgoogle.com**
2. Describir la vista o subir el wireframe del PDF del proyecto
3. Ajustar el resultado al estilo de Cookr (app gastronómica, mobile-first, tonos cálidos)
4. Exportar dos ficheros:
   - `<nombreVista>.png` → captura visual del diseño final
   - `<nombreVista>.html` → código HTML generado por Stitch
5. Guardar ambos en `docs/stitch/<nombreVista>/`
6. Al iniciar la sesión de implementación con Claude Code, adjuntar ambos ficheros

---

## Instrucción para Claude Code al adjuntar Stitch

Incluye siempre esta instrucción junto a los ficheros:

```
Usa los ficheros de Stitch adjuntos SOLO como referencia visual de
layout, estructura y jerarquía. Implementa la vista con el stack
del proyecto: shadcn/ui, paleta Cookr (globals.css), Tailwind CSS,
Framer Motion para animaciones y Lucide React para iconos.
No copies código de Stitch directamente.
```

---

## Qué usa Claude Code de Stitch

| ✅ SÍ usar | ❌ NO usar |
|---|---|
| Posición y orden de elementos | Código HTML de Stitch |
| Tamaño relativo de secciones | Colores de Stitch (usar paleta Cookr) |
| Jerarquía visual (qué destaca) | Componentes propios de Stitch |
| Número de columnas mobile/desktop | Fuentes de Stitch (usar Geist) |
| Qué secciones existen y en qué orden | Clases CSS de Stitch |

---

## Cómo traduce Claude Code el diseño de Stitch al proyecto

| Stitch muestra | Claude Code implementa |
|---|---|
| Card con fondo blanco y borde gris | `<Card className="bg-card border-border">` |
| Botón naranja primario | `<Button className="bg-brand text-brand-foreground">` |
| Input con label | shadcn `<FormField>` + `<Input>` + `<Label>` |
| Texto gris secundario | `<p className="text-muted-foreground">` |
| Fondo de página | `<div className="bg-background">` |
| Icono de búsqueda | `<Search className="text-muted-foreground" />` (Lucide) |
| Animación de entrada | `<motion.div>` con Framer Motion / BlurFade de Magic UI |
| Lista animada | `<AnimatedList>` de Magic UI |
| Transición entre pasos | Motion Primitives |

---

## Nomenclatura de carpetas docs/stitch/

| Vista | Carpeta | Sprint |
|---|---|---|
| Home / Feed | `docs/stitch/home/` | Sprint 2 |
| Detalle de receta | `docs/stitch/detalleReceta/` | Sprint 2 |
| Crear receta | `docs/stitch/crearReceta/` | Sprint 3 |
| Buscar recetas | `docs/stitch/buscarRecetas/` | Sprint 3 |
| Perfil | `docs/stitch/perfil/` | Sprint 4 |
| Recetas guardadas | `docs/stitch/recetasGuardadas/` | Sprint 4 |
| Despensa | `docs/stitch/despensa/` | Sprint 5 |
| Chat IA | `docs/stitch/chat/` | Sprint 5 |
| Grupos | `docs/stitch/grupos/` | Sprint 6 |
| Notificaciones | `docs/stitch/notificaciones/` | Sprint 6 |
| Ajustes | `docs/stitch/ajustes/` | Sprint 7 |
| Help / FAQ | `docs/stitch/help/` | Sprint 7 |

> La NavBar inferior no requiere Stitch — es un componente global de navegación.

---

## Prompt sugerido para Stitch

Al describir una vista, usa este contexto para que Stitch genere algo cercano a Cookr:

```
App de red social gastronómica llamada Cookr. Diseño mobile-first (375px de ancho),
estilo moderno y limpio. Paleta cálida con tonos ocre y naranja suave, fondos crema.
App instalable en móvil (PWA). Barra de navegación inferior con 5 iconos.
La vista que necesito es: [descripción detallada de la vista].
```

---

## Estado de los diseños Stitch

| Vista | Ficheros | Estado |
|---|---|---|
| Home / Feed | `home.png` + `home.html` | ⏳ Pendiente crear |
| Detalle de receta | `detalleReceta.png` + `detalleReceta.html` | ⏳ Pendiente crear |
| Crear receta | — | ⏳ Sprint 3 |
| Perfil | — | ⏳ Sprint 4 |
| Despensa | — | ⏳ Sprint 5 |
| Chat IA | — | ⏳ Sprint 5 |
| Grupos | — | ⏳ Sprint 6 |

> Actualiza esta tabla cuando guardes cada diseño.
