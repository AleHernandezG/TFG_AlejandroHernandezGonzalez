# Stitch by Google — Guía de uso para Cookr

## ¿Qué es Stitch?

Stitch by Google (stitch.withgoogle.com) es una herramienta de IA que genera
diseños de interfaz a partir de descripciones o wireframes. Se usa en este
proyecto como referencia visual antes de implementar cada vista FE.

## Flujo obligatorio

Antes de implementar cualquier vista FE nueva:

1. Ir a stitch.withgoogle.com
2. Describir la vista o subir el wireframe correspondiente del PDF
3. Ajustar el diseño generado al estilo de Cookr (app gastronómica, mobile-first)
4. Exportar:
   - PNG → captura de pantalla del diseño final
   - HTML → código generado por Stitch
5. Guardar ambos en `docs/stitch/<nombreVista>/`
6. Al iniciar la sesión con Claude Code, adjuntar ambos ficheros

## Qué le pides a Claude Code

Al adjuntar los ficheros de Stitch, incluye siempre esta instrucción:

> "Usa los ficheros de Stitch adjuntos como referencia visual de layout
> y estructura. Implementa la vista con el stack del proyecto:
> componentes shadcn/ui, paleta Cookr (globals.css), Tailwind CSS,
> Framer Motion para animaciones y Lucide React para iconos.
> No copies código de Stitch directamente."

## Qué usa Claude Code de Stitch

✅ USAR:
- Posición y orden de los elementos (layout)
- Tamaño relativo de cada sección
- Jerarquía visual (qué destaca, qué es secundario)
- Número de columnas y distribución en mobile vs desktop
- Qué secciones existen y en qué orden aparecen

❌ NO USAR:
- Código HTML de Stitch (siempre JSX/TSX con shadcn + Tailwind)
- Colores de Stitch (siempre variables CSS Cookr: --brand, --background...)
- Componentes propios de Stitch
- Fuentes de Stitch (siempre Geist de shadcn Nova)
- Clases CSS específicas de Stitch

## Nomenclatura de carpetas

| Vista | Carpeta |
|---|---|
| Home / Feed | `docs/stitch/home/` |
| Detalle de receta | `docs/stitch/detalleReceta/` |
| Crear receta | `docs/stitch/crearReceta/` |
| Perfil | `docs/stitch/perfil/` |
| Despensa | `docs/stitch/despensa/` |
| Chat IA | `docs/stitch/chat/` |
| Grupos | `docs/stitch/grupos/` |
| Notificaciones | `docs/stitch/notificaciones/` |
| Ajustes | `docs/stitch/ajustes/` |

## Prompt sugerido para Stitch

Al describir una vista en Stitch, usa este contexto:

> "App de red social gastronómica llamada Cookr. Diseño mobile-first,
> estilo moderno y limpio. Paleta cálida con tonos ocre/naranja.
> App instalable en móvil (PWA). La vista es: [descripción de la vista].
> Incluye barra de navegación inferior con 5 iconos."
