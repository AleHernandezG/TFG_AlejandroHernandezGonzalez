import type { Metadata } from 'next'
import Link from 'next/link'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Política de privacidad — Cookr',
  description:
    'Cómo Cookr recopila, usa y protege tus datos personales.',
}

const ULTIMA_ACTUALIZACION = '23 de marzo de 2026'

const secciones = [
  { id: 'responsable',     titulo: '1. Responsable del tratamiento' },
  { id: 'datos',          titulo: '2. Datos que recopilamos' },
  { id: 'finalidad',      titulo: '3. Para qué usamos tus datos' },
  { id: 'terceros',       titulo: '4. Servicios de terceros' },
  { id: 'retencion',      titulo: '5. Retención de datos' },
  { id: 'derechos',       titulo: '6. Tus derechos (RGPD)' },
  { id: 'seguridad',      titulo: '7. Seguridad' },
  { id: 'menores',        titulo: '8. Menores de edad' },
  { id: 'cambios',        titulo: '9. Cambios en esta política' },
  { id: 'contacto',       titulo: '10. Contacto' },
]

export default function PaginaPrivacidad() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Cabecera ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 md:px-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-brand transition-opacity hover:opacity-70"
            aria-label="Volver a Cookr"
          >
            <ChefHat className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">Cookr</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-12 md:px-10 md:py-16">

        {/* ── Título ────────────────────────────────────────────────── */}
        <div className="mb-10">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Legal
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Política de privacidad
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {ULTIMA_ACTUALIZACION}
          </p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            En <strong className="text-foreground">Cookr</strong> nos tomamos en serio la
            privacidad de nuestros usuarios. Esta política explica qué datos recopilamos,
            cómo los usamos y qué derechos tienes sobre ellos, en cumplimiento del
            Reglamento General de Protección de Datos (RGPD / UE 2016/679).
          </p>
          <div className="mt-4 rounded-lg border border-brand/20 bg-[var(--brand-subtle)] px-4 py-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Aviso académico —</strong> Cookr es un
            Trabajo de Fin de Grado. Los datos recogidos no se utilizarán con fines
            comerciales ni se cederán a terceros fuera del contexto académico de la
            aplicación.
          </div>
        </div>

        {/* ── Índice ────────────────────────────────────────────────── */}
        <nav aria-label="Índice de secciones" className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            En esta página
          </p>
          <ol className="space-y-1.5">
            {secciones.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Separator className="mb-12 opacity-40" />

        {/* ── Secciones ─────────────────────────────────────────────── */}
        <article className="space-y-12 text-[0.9375rem] leading-relaxed">

          {/* 1 */}
          <section id="responsable">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              1. Responsable del tratamiento
            </h2>
            <p className="text-muted-foreground">
              El responsable del tratamiento de los datos es el autor del TFG, estudiante
              de la Universidad correspondiente. Cookr es una aplicación de carácter
              académico sin personalidad jurídica propia. Para cualquier consulta sobre
              privacidad puedes contactar a través del formulario indicado en la
              sección&nbsp;10.
            </p>
          </section>

          {/* 2 */}
          <section id="datos">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              2. Datos que recopilamos
            </h2>
            <div className="space-y-5 text-muted-foreground">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  2.1 Datos que tú nos proporcionas
                </h3>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Nombre completo y dirección de correo electrónico (registro con email)</li>
                  <li>Foto de perfil (si la subes o proviene de tu cuenta de Google)</li>
                  <li>Contraseña (almacenada únicamente como hash bcrypt, nunca en texto plano)</li>
                  <li>Recetas, ingredientes y pasos que publicas en la plataforma</li>
                  <li>Contenido de tu despensa virtual (ingredientes y caducidades)</li>
                  <li>Mensajes enviados al asistente de IA</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  2.2 Datos que recogemos automáticamente
                </h3>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Preferencias e historial de recetas guardadas o valoradas</li>
                  <li>Grupos a los que perteneces y usuarios que sigues</li>
                  <li>Dirección IP y tipo de navegador (registros de acceso básicos)</li>
                  <li>Datos de uso agregados y anónimos (para mejorar la aplicación)</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  2.3 Datos de terceros — Google OAuth
                </h3>
                <p>
                  Si te registras con Google, recibimos de Google: nombre, correo electrónico
                  y foto de perfil. No recibimos tu contraseña de Google en ningún momento.
                </p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="finalidad">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              3. Para qué usamos tus datos
            </h2>
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Finalidad</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Base legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-muted-foreground">
                  <tr>
                    <td className="px-4 py-3">Gestionar tu cuenta y autenticación</td>
                    <td className="px-4 py-3">Ejecución del contrato</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Personalizar el feed y las sugerencias de recetas</td>
                    <td className="px-4 py-3">Interés legítimo</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Proporcionar el asistente de IA con contexto de tu despensa</td>
                    <td className="px-4 py-3">Ejecución del contrato</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Enviar emails de verificación de cuenta</td>
                    <td className="px-4 py-3">Ejecución del contrato</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Calcular información nutricional de tus recetas</td>
                    <td className="px-4 py-3">Interés legítimo</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Almacenar y optimizar imágenes de recetas</td>
                    <td className="px-4 py-3">Ejecución del contrato</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Fines académicos y de investigación (TFG)</td>
                    <td className="px-4 py-3">Interés legítimo académico</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 */}
          <section id="terceros">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              4. Servicios de terceros
            </h2>
            <p className="mb-4 text-muted-foreground">
              Cookr integra los siguientes servicios externos, cada uno con su propia
              política de privacidad:
            </p>
            <div className="space-y-3">
              {[
                {
                  nombre: 'Google OAuth 2.0',
                  uso: 'Autenticación con cuenta de Google',
                  url: 'https://policies.google.com/privacy',
                },
                {
                  nombre: 'Google Gemini API',
                  uso: 'Asistente culinario con IA (chat con contexto de despensa)',
                  url: 'https://ai.google.dev/terms',
                },
                {
                  nombre: 'Edamam API',
                  uso: 'Cálculo nutricional automático de recetas',
                  url: 'https://www.edamam.com/privacy-policy',
                },
                {
                  nombre: 'Cloudinary',
                  uso: 'Almacenamiento y CDN de imágenes de recetas y avatares',
                  url: 'https://cloudinary.com/privacy',
                },
                {
                  nombre: 'Resend',
                  uso: 'Envío de emails de verificación y notificaciones',
                  url: 'https://resend.com/privacy',
                },
                {
                  nombre: 'MongoDB Atlas',
                  uso: 'Base de datos en la nube',
                  url: 'https://www.mongodb.com/legal/privacy-policy',
                },
                {
                  nombre: 'Vercel',
                  uso: 'Alojamiento del frontend',
                  url: 'https://vercel.com/legal/privacy-policy',
                },
              ].map((servicio) => (
                <div
                  key={servicio.nombre}
                  className="flex flex-col gap-1 rounded-lg border border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{servicio.nombre}</p>
                    <p className="text-sm text-muted-foreground">{servicio.uso}</p>
                  </div>
                  <a
                    href={servicio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-brand hover:underline"
                  >
                    Ver política →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section id="retencion">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              5. Retención de datos
            </h2>
            <p className="text-muted-foreground">
              Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta,
              borraremos tus datos personales en un plazo máximo de{' '}
              <strong className="text-foreground">30 días</strong>, salvo aquellos que
              debamos conservar por obligación legal. Los mensajes del chat con el asistente
              de IA se eliminan automáticamente pasados{' '}
              <strong className="text-foreground">90 días</strong> de inactividad.
            </p>
          </section>

          {/* 6 */}
          <section id="derechos">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              6. Tus derechos (RGPD)
            </h2>
            <p className="mb-4 text-muted-foreground">
              Como usuario con residencia en la Unión Europea, tienes los siguientes derechos:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                ['Acceso', 'Solicitar una copia de todos tus datos personales.'],
                ['Rectificación', 'Corregir datos inexactos o incompletos.'],
                ['Supresión', 'Solicitar el borrado de tus datos («derecho al olvido»).'],
                ['Portabilidad', 'Recibir tus datos en un formato estructurado y legible por máquina.'],
                ['Oposición', 'Oponerte al tratamiento basado en interés legítimo.'],
                ['Limitación', 'Restringir el tratamiento mientras se resuelve una reclamación.'],
              ].map(([titulo, desc]) => (
                <li key={titulo} className="flex gap-2">
                  <span className="mt-0.5 font-semibold text-foreground shrink-0">{titulo}:</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-muted-foreground">
              Para ejercer cualquiera de estos derechos, contacta a través de la sección 10.
              Tienes derecho a presentar una reclamación ante la{' '}
              <strong className="text-foreground">
                Agencia Española de Protección de Datos (AEPD)
              </strong>{' '}
              si consideras que el tratamiento no es correcto.
            </p>
          </section>

          {/* 7 */}
          <section id="seguridad">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              7. Seguridad
            </h2>
            <p className="text-muted-foreground">
              Aplicamos las siguientes medidas técnicas para proteger tus datos:
            </p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5 text-muted-foreground">
              <li>Contraseñas hasheadas con <strong className="text-foreground">bcrypt</strong> (nunca almacenadas en texto plano)</li>
              <li>Comunicaciones cifradas mediante <strong className="text-foreground">HTTPS/TLS</strong></li>
              <li>Tokens JWT con expiración y rotación de tokens de refresco</li>
              <li>Rate limiting en todos los endpoints de la API para prevenir abuso</li>
              <li>Acceso a la base de datos restringido y cifrado en reposo (MongoDB Atlas)</li>
            </ul>
          </section>

          {/* 8 */}
          <section id="menores">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              8. Menores de edad
            </h2>
            <p className="text-muted-foreground">
              Cookr no está dirigida a menores de{' '}
              <strong className="text-foreground">14 años</strong>. Si tienes conocimiento
              de que un menor nos ha proporcionado datos personales sin consentimiento
              parental, contacta con nosotros para proceder a su eliminación inmediata.
            </p>
          </section>

          {/* 9 */}
          <section id="cambios">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              9. Cambios en esta política
            </h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta política para reflejar cambios en la aplicación o en
              la legislación aplicable. Notificaremos los cambios relevantes por correo
              electrónico o mediante un aviso visible en la aplicación. La fecha de
              «última actualización» al inicio de esta página siempre indica la versión
              vigente.
            </p>
          </section>

          {/* 10 */}
          <section id="contacto">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              10. Contacto
            </h2>
            <p className="text-muted-foreground">
              Para cualquier consulta, solicitud de ejercicio de derechos o reclamación
              relacionada con esta política de privacidad, puedes contactarnos a través del{' '}
              <Link href="/contacto" className="text-brand hover:underline">
                formulario de contacto
              </Link>{' '}
              de la aplicación. Responderemos en un plazo máximo de{' '}
              <strong className="text-foreground">30 días hábiles</strong>.
            </p>
          </section>

        </article>

        {/* ── Pie ───────────────────────────────────────────────────── */}
        <Separator className="my-12 opacity-40" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cookr — Trabajo de Fin de Grado.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/terminos" className="text-muted-foreground hover:text-brand transition-colors">
              Términos de uso
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-brand transition-colors">
              Inicio
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
