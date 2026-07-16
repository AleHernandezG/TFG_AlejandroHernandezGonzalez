---
name: cookr-memoria
description: Redactar y revisar la memoria y los anexos del TFG en LaTeX según las reglas de corrección del tutor (Álvaro Lozano Murciego). Úsala al tocar documentacion/ u overleaf/, requisitos, análisis, diseño, objetivos o diagramas.
---

# Memoria y anexos del TFG

Reglas con las que corrige el tutor. Respetarlas evita otra ronda de correcciones.

## Regla de oro: análisis = el Qué, diseño = el Cómo

Es la que más repite (Proceso Unificado/RUP).

En **requisitos y análisis** no entra nada de implementación: ni tecnologías, ni rutas (`/home`, `/discover`), ni códigos HTTP (404, 409), ni *token*, SSO, cookies, *debounce*, base64, Wake Lock, TTS, Render, Gemini.

Se describe la intención: «si la receta no existe, la operación falla y se informa del error al usuario», nunca «(404)». Todo el detalle técnico va al Anexo II (diseño) y al capítulo de implementación.

## Requisitos (Anexo I)

- **Sin pasado.** La ERS dice lo que el sistema **debe** hacer: presente o futuro. Nunca «se ha diseñado», «se ha buscado».
- La especificación de requisitos **es lo primero que se hace**, no un cierre. No la enmarques como «por último… para su desarrollo posterior».
- **No menciones la IEEE 830-1998.** La estructura es la de las plantillas de **Durán y Bernárdez** (USAL) y con eso basta.
- **Objetivos del sistema**: primero un párrafo con el objetivo general en `\textbf{}`; luego las tablas con los específicos.
- **Anglicismos en cursiva** (`\textit{}`): *feed*, *scroll*, *chatbot*, *frontend*, *backend*. Mejor aún, traduce: like → «me gusta», email → correo, home → pantalla principal, token → código o credencial, URL → enlace, API → servicio externo.
- **Herencia de actores solo si es un *is-a* real.** Usuario registrado y no registrado **no** heredan (el registrado no puede registrarse): son actores separados por estado de sesión.
- **Relaciones de casos de uso**: `include` va Base → Incluido; `extend` va Extensión → Base. **Ningún actor se asocia con un caso de extensión**: el actor entra por el caso base.
- **Requisito vago = no requisito.** Los RNF deben ser medibles: versiones concretas de navegador, no «debe funcionar en los navegadores actuales».

## Objetivos (capítulo de la memoria)

En **futuro/prospectivo**, nunca en pasado: los objetivos se fijan al principio del proyecto, no son una crónica de lo hecho.

Evita «sirvió», «había proporcionado», «era construir», «resultaban nuevos». Usa «debe» («la aplicación debe obtener…»). Los verbos que encabezan cada objetivo, en infinitivo: desarrollar, integrar, implementar.

## Análisis y diseño (Anexo II)

**Modelo de dominio:**

- Ingrediente y alérgeno son **entidades propias** (se comparten y son la base de filtros y recomendación).
- El «me gusta» **no es un atributo** de la receta: es una entidad de valoración (*rating*, tabla intermedia entre usuario y receta). El tutor es estricto aquí porque investiga sistemas de recomendación.
- En el código real `likes` es un `ObjectId[]` con referencia a Usuario embebido en la receta, sin marca de tiempo. Modela *rating* en dominio y análisis, y **explica la desnormalización** al llegar al diseño de datos.

**Modelo de datos:** diagrama de **colecciones MongoDB** (embebido por composición frente a referencia por ObjectId), no un diagrama de clases UML genérico.

**Diagramas de paquetes y dependencias:**

- Flechas discontinuas = flechas de uso.
- Sentido correcto: VIEW → STORE → SERVICE → servidor. El store **nunca** depende de la UI.
- **Nunca flechas en ambos sentidos** entre dos paquetes: cada dependencia es unidireccional hacia el paquete base.
- Autenticación es paquete base: recetas, social, despensa e IA dependen de ella, no al revés.
- El asistente de IA depende de recetas y despensa, no la despensa de la IA.
- Los paquetes de las realizaciones de CU deben ser **los mismos** que en requisitos, y reflejarse también en diseño.

**Arquitectura:** diagrama de paquetes y «zoom» por paquete (cliente, servidor, servicios externos), justificando en cada sección las decisiones tecnológicas (por qué este framework y no otro, por qué servidor propio y no BaaS).

**Diagrama de despliegue:** concreta todo, sin nodos genéricos tipo «Servicio de IA». Los proveedores reales son Vercel, Render, MongoDB Atlas, Google Gemini, Pexels, Edamam, USDA FoodData Central, Mailjet y Google OAuth.

**Mapa de navegación:** diagrama de navegación con retornos, no el de paquetes. Sin callejones sin salida (editar receta vuelve al detalle). Hub de pestañas con la barra inferior.

## Citas y siglas

- **Cada tecnología nombrada lleva su cita al lado**: Next.js, Axios, Mongoose, Express, Gemini, Pexels, Edamam, USDA.
- Para UML cita a **Grady Booch** (*The UML User Guide*) o la especificación de la OMG. **Nunca** a Alicia García-Holgado como fuente de UML: no inventó UML.
- Define cada sigla **una sola vez**, en su primera aparición: BaaS (Backend as a Service), DBaaS (Database as a Service), CRUD.
- **MongoDB Atlas es un DBaaS**, no «una base de datos documental». Eso es MongoDB, el motor.

## Referencias cruzadas

Nunca escribas «Anexo II» ni «capítulo 3» a mano: se desincronizan. Es criterio de evaluación explícito.

- **En la memoria** (`capitulos/`, dentro de `memtfg.tex`): anexos con `\anexoref{...}`, capítulos y secciones con `\autoref{...}`.
- Etiquetas: `anexo:especificaciones` (I), `anexo:analisis-diseno` (II), `anexo:estimacion` (III), `anexo:seguridad` (IV), `anexo:doc-tecnica` (V), `anexo:manual` (VI).
- **Excepción: dentro de un anexo NO uses `\anexoref`** para citar a otro anexo. Cada anexo se compila suelto con su wrapper `anexoN.tex` y el label del otro no existe (saldría «Anexo ??»). Ahí van como texto fijo: «Anexo~I», «Anexo~II». Para figuras, tablas y secciones **propias** del anexo sí se usa `\autoref`.
- Cuidado con el género: `\autoref{fig:...}` renderiza «figura» (femenino). Se escribe «la figura», no «el figura».

Al revisar un capítulo, barre las menciones a «Anexo», «capítulo», «apartado» o «sección» seguidas de número a mano.

## Flujo de trabajo

Se edita en `documentacion/memoria` y los cambios se aplican **a mano en Overleaf**: deja los cambios como bloques Buscar/Reemplazar en un `CAMBIOS_*.md`.

Diagramas con PlantUML:

```bash
java -jar documentacion/memoria/.tools/plantuml.jar -charset UTF-8 -tpng -Sdpi=200 <fichero.puml>
```

## Estilo

Español, tono directo. Prohibido: «cabe destacar», «es importante mencionar», «en el panorama actual», *delve*, *leverage*, *robust*, *seamless*. Sin listas de exactamente tres puntos ni negritas mecánicas en cada párrafo.

No uses las skills `humanize`, `humanize-writing` ni `humanizer`.
