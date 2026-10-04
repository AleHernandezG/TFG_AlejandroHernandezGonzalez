# 0002 · El correo sale por HTTP, no por SMTP

**Fecha:** escrita el 4 de octubre de 2026; la decisión es anterior y ya estaba en `CLAUDE.md` · **Estado:** aceptada · **Origen:** F10.4 del plan, regla «El correo va por HTTP» de `CLAUDE.md`

## Contexto

Cookr manda dos correos: el de verificación de cuenta y el de recuperación de contraseña. El backend
vive en Render, y Render bloquea los puertos de SMTP saliente. Un envío por SMTP funciona en local y
no sale nunca en producción.

## Decisión

`backend/src/lib/email.ts` habla con la API REST de Mailjet (`https://api.mailjet.com/v3.1/send`)
con `axios`, sin SDK y sin SMTP. `SENDER_EMAIL` es obligatoria: sin ella `enviarEmail` lanza un
error que la nombra y `server.ts` avisa al arrancar. `REPLY_TO_EMAIL` es opcional.

## Alternativa descartada

Nodemailer o cualquier cliente SMTP, que es lo primero que se le ocurre a quien llega al código. Se
descarta por el bloqueo de puertos de Render: no es una preferencia, es que no funciona en
producción.

Por qué Mailjet y no otro proveedor con API HTTP no está escrito ni en `CLAUDE.md` ni en
`docs/cambios/`, así que aquí no se da un motivo. Lo que sí está escrito, en F7.4, es el criterio de
no arrastrar un SDK cuando la llamada son unas líneas de `axios`.

## Consecuencias

- Nadie debe «arreglar» `email.ts` migrándolo a SMTP. La regla está en `CLAUDE.md` por eso.
- Mailjet responde 200 aunque el correo no llegue. El remitente tiene que estar en un dominio con
  SPF y DKIM alineados; enviando desde `@gmail.com` o `@usal.es` falla DMARC y Outlook y Hotmail lo
  descartan en silencio. El backend avisa al arrancar si el remitente es de uno de esos dominios,
  pero no bloquea. Hoy se envía desde Gmail y se asume que Outlook puede no recibir (F0 del plan).
- No hay forma de saber desde el código si un correo llegó. Está en `estado/pruebas-manuales.md`
  porque un test no puede comprobarlo.
- El registro manda el correo sin esperar (*fire and forget*): responde 201 aunque Mailjet falle. Sin
  claves de Mailjet, en local, la cuenta se queda sin verificar y hay que marcarla a mano en la base.
- Los tests mockean `lib/email.ts` siempre; ninguno gasta cuota de Mailjet.
