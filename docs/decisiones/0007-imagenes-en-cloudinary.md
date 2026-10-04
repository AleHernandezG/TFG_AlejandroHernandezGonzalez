# 0007 · Las imágenes van a Cloudinary, y las sube el navegador

**Fecha:** 4 de septiembre de 2026 (escrita el 4 de octubre) · **Estado:** aceptada · **Origen:** A5 de la auditoría, F7.4 del plan, `cambios/f7-rendimiento.md` (PERF-004)

## Contexto

Las fotos de receta y los avatares se guardaban en Mongo como base64. Medido contra Atlas, de los
6,72 MB que ocupaban `recetas` y `usuarios`, 6,47 MB eran base64 y unos 250 KB contenido de verdad.
Una receta con foto propia pesaba 412 KB de media. Además, el fichero cruzaba el backend en cada
subida, y por eso el límite de cuerpo de `/api/recetas` y `/api/usuarios` estaba en 10 MB.

Había dos cosas que decidir y las dos cambiaban todo lo demás: dónde se guardan las imágenes y
quién sube el fichero. Se pararon y las decidió Alejandro con los números delante.

## Decisión

**Cloudinary**, y **subida directa desde el navegador con firma del backend**.

El navegador pide una firma a `POST /api/subidas/firma`, sube el fichero a Cloudinary y manda a la
API solo la URL `https` que le devuelven. `lib/cloudinary.ts` firma con SHA-1 usando `crypto` y,
cuando hace falta subir desde el servidor, usa `axios`. Sin SDK.

El `public_id` del avatar es `cookr/avatares/<id>`, determinista, para que cambiar de foto
sobrescriba. El de receta lleva marca de tiempo y azar.

## Alternativa descartada

**Cloudflare R2** como proveedor. Lo que está escrito es por qué se eligió Cloudinary: el plan
gratuito y las transformaciones por URL. No hay más detalle sobre R2 en `cambios/f7-rendimiento.md`
ni en `CLAUDE.md`, así que no se añade.

**Seguir mandando el base64 al backend y que él lo reenvíe.** Era menos trabajo. Se descarta porque
no quita el problema de raíz: solo si el fichero no atraviesa Render puede bajar de verdad el límite
de cuerpo, que pasó de 10 MB a 100 KB.

**El SDK de Cloudinary.** La firma son cuatro líneas de `crypto` y la subida un `POST`. Es el mismo
criterio que en `lib/email.ts`.

## Consecuencias

- Sin `CLOUDINARY_URL`, `POST /api/subidas/firma` responde 503 y no se puede subir ninguna foto.
- Las imágenes de Cookr dependen del plan gratuito de un tercero.
- La subida ocurre al elegir el fichero, no al publicar. Una foto elegida para una receta que luego
  no se publica ya está en Cloudinary, y no está escrito que nada la limpie. Quedan además fotos
  huérfanas de antes de que el borrado existiera, que hay que quitar a mano
  (`estado/pendientes.md`).
- Crear, editar y borrar recetas llama a `eliminarImagen`. Los tests tienen que mockear
  `lib/cloudinary.ts` o borrarían ficheros de verdad.
- `imagenUrl` y `fotoUrl` se validan contra `^https://` con un regex. `z.string().url()` no vale:
  un `data:` URI es una URL válida y aceptaría justo lo que hay que prohibir.
- El chat y el escaneo de tickets siguen mandando base64, porque esa imagen va a Gemini y no se
  guarda. Por eso `/api/chat` y `/api/despensa` se quedan en 8 MB.
- El avatar, al ser ya una URL, viaja en la cookie de NextAuth. Los filtros de `lib/auth.ts` que
  descartan `data:` se quedan como red para datos viejos.
- La migración de lo que ya había se hizo el mismo día contra Atlas (6,72 MB → 0,24 MB), con copia
  previa fuera del repositorio.
