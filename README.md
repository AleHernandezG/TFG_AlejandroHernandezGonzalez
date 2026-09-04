# Cookr

Aplicación web para cocinar con lo que tienes. Cookr guarda tus recetas, conoce tus alergias y usa un asistente de IA para generar recetas, escanear el ticket de la compra y resolver dudas mientras cocinas.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Gemini-8E75B2?logo=googlegemini&logoColor=white)

## Qué hace

- **Recetas con IA.** Le dices qué tienes o qué te apetece y genera una receta completa, con ingredientes, pasos y datos nutricionales.
- **Escaneo de tickets.** Subes la foto del ticket de la compra y la IA extrae los productos para llenar tu despensa sin teclear.
- **Despensa.** Lo que tienes en casa, siempre a mano. Las recetas se filtran por lo que puedes cocinar ahora mismo.
- **Alergias y preferencias.** El perfil recuerda tus alergias y ajusta tanto las recomendaciones como lo que la IA propone. Son datos de salud y se tratan como tal.
- **Colecciones y descubrimiento.** Guarda recetas, organiza las tuyas y explora las de la comunidad.
- **Chat de cocina.** Un asistente al que preguntar sustituciones, cantidades o cómo adaptar un plato.
- **Cuentas y sesión.** Registro con correo verificado o entrada con Google.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Cliente | Next.js (App Router), React, TanStack Query, Zustand, React Hook Form + Zod, Tailwind CSS, shadcn/ui, Framer Motion |
| Servidor | Node, Express, helmet, cors, morgan, Zod |
| Datos | MongoDB Atlas con Mongoose |
| Sesión | NextAuth (credenciales y Google), JWT, bcrypt |
| Servicios | Gemini (IA), Mailjet (correo), Edamam y USDA (nutrición), Pexels (imágenes) |
| Despliegue | Vercel (cliente), Render (servidor), GitHub Actions (CI/CD) |

## Estructura

Es un *monorepo* con dos aplicaciones independientes:

```
frontend/   Cliente Next.js (App Router, código por features)
backend/    API REST sobre Express, organizada en capas
scripts/    Utilidades de arranque y mantenimiento
```

## Puesta en marcha

Necesitas Node 20, una cuenta de MongoDB Atlas y las claves de los servicios externos (Google OAuth, Gemini, Edamam/USDA, Pexels y Mailjet).

```bash
# 1. Instalar dependencias
cd frontend && npm install
cd ../backend && npm install

# 2. Configurar el entorno
#    frontend/.env.local y backend/.env
#    (cada uno tiene su .env.example como plantilla)

# 3. Datos de prueba (opcional)
cd backend && npm run seed:completo

# 4. Arrancar cliente (:3000) y servidor (:4000)
cd frontend && npm run dev
cd backend  && npm run dev
```

## Despliegue

Cada `push` a `main` dispara el flujo de GitHub Actions: comprueba el cliente y el servidor (linting y tipos) y, si todo pasa, publica el servidor en Render mediante un *deploy hook*. El cliente se publica solo en Vercel a través de su integración con Git. La base de datos vive en MongoDB Atlas.

## Documentación

La documentación de desarrollo está en [`docs/`](docs/): auditoría, plan de trabajo, referencia técnica y material de diseño.

La memoria del TFG y los anexos (manual de usuario, plan de proyecto, plan de seguridad y documentación técnica) se llevan en un repositorio aparte, fuera de este. No son código de Cookr y no se versionan con él.

## Autor

Alejandro Hernández González
