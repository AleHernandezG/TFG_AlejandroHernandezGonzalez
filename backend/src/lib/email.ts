import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { lookup } from "dns/promises";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM = GMAIL_USER ?? "noreply@cookr.app";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const SMTP_HOST = "smtp.gmail.com";

let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const { address } = await lookup(SMTP_HOST, { family: 4 });
      const options: SMTPTransport.Options = {
        host: address,
        port: 465,
        secure: true,
        tls: { servername: SMTP_HOST },
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      };
      return nodemailer.createTransport(options);
    })().catch((err) => {
      transporterPromise = null;
      throw err;
    });
  }
  return transporterPromise;
}

export async function enviarEmailVerificacion(
  correo: string,
  nombre: string,
  token: string,
): Promise<void> {
  const enlace = `${FRONTEND_URL}/verificar-email?token=${token}`;
  const transporter = await getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: correo,
    subject: "Verifica tu cuenta en Cookr",
    html: plantillaVerificacion(nombre, enlace),
  });
}

export async function enviarEmailRecuperacion(
  correo: string,
  nombre: string,
  token: string,
): Promise<void> {
  const enlace = `${FRONTEND_URL}/nueva-contrasena?token=${token}`;
  const transporter = await getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: correo,
    subject: "Restablece tu contraseña en Cookr",
    html: plantillaRecuperacion(nombre, enlace),
  });
}

function plantillaVerificacion(nombre: string, enlace: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1208;padding:28px 40px;text-align:center;">
              <span style="font-size:24px;font-weight:900;font-style:italic;color:#f5e6c8;letter-spacing:-0.5px;">🍳 Cookr</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1208;">Hola, ${nombre} 👋</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444444;">
                Gracias por unirte a Cookr. Para activar tu cuenta y empezar a descubrir recetas personalizadas, confirma tu dirección de correo haciendo clic en el botón de abajo.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#444444;">
                Este enlace es válido durante <strong>24 horas</strong>.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#c47c1a;border-radius:6px;">
                    <a href="${enlace}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Verificar mi cuenta</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:13px;color:#888888;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:monospace;word-break:break-all;">${enlace}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;text-align:center;">
                Si no creaste una cuenta en Cookr, ignora este email. Nadie más podrá acceder a tu cuenta sin este enlace.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function plantillaRecuperacion(nombre: string, enlace: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1208;padding:28px 40px;text-align:center;">
              <span style="font-size:24px;font-weight:900;font-style:italic;color:#f5e6c8;letter-spacing:-0.5px;">🍳 Cookr</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1208;">Hola, ${nombre} 👋</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444444;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Cookr. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#444444;">
                Este enlace es válido durante <strong>1 hora</strong>. Si no lo usas, tu contraseña actual seguirá siendo la misma.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#c47c1a;border-radius:6px;">
                    <a href="${enlace}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Restablecer contraseña</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:13px;color:#888888;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:monospace;word-break:break-all;">${enlace}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;text-align:center;">
                Si no solicitaste restablecer tu contraseña en Cookr, ignora este email. Tu contraseña no cambiará.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
