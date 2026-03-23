import type { Metadata } from 'next'
import Link from 'next/link'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Términos de uso — Cookr',
  description:
    'Condiciones de uso de la plataforma Cookr — red social gastronómica.',
}

const ULTIMA_ACTUALIZACION = '23 de marzo de 2026'

const secciones = [
  { id: 'aceptacion',     titulo: '1. Aceptación de los términos' },
  { id: 'descripcion',    titulo: '2. Descripción del servicio' },
  { id: 'cuenta',         titulo: '3. Tu cuenta' },
  { id: 'contenido',      titulo: '4. Contenido del usuario' },
  { id: 'uso-aceptable',  titulo: '5. Uso aceptable' },
  { id: 'ia',             titulo: '6. Asistente de inteligencia artificial' },
  { id: 'propiedad',      titulo: '7. Propiedad intelectual' },
  { id: 'disponibilidad', titulo: '8. Disponibilidad del servicio' },
  { id: 'responsabilidad',titulo: '9. Limitación de responsabilidad' },
  { id: 'cambios',        titulo: '10. Cambios en los términos' },
  { id: 'contacto',       titulo: '11. Contacto' },
]

export default function PaginaTerminos() {
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
            Términos de uso
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {ULTIMA_ACTUALIZACION}
          </p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Bienvenido a <strong className="text-foreground">Cookr</strong>. Al crear una
            cuenta o utilizar cualquier parte de la plataforma, aceptas estos Términos de
            uso en su totalidad. Léelos con atención antes de continuar.
          </p>
          <div className="mt-4 rounded-lg border border-brand/20 bg-[var(--brand-subtle)] px-4 py-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Aviso académico —</strong> Cookr es un
            Trabajo de Fin de Grado sin finalidad comercial. Su uso es exclusivamente
            educativo y de demostración técnica.
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
          <section id="aceptacion">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              1. Aceptación de los términos
            </h2>
            <p className="text-muted-foreground">
              Al acceder o usar Cookr, confirmas que tienes al menos{' '}
              <strong className="text-foreground">14 años</strong>, que has leído y
              entendido estos términos y que aceptas quedar vinculado por ellos. Si
              utilizas Cookr en nombre de una organización, declaras que tienes autoridad
              para aceptar estos términos en su nombre.
            </p>
          </section>

          {/* 2 */}
          <section id="descripcion">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              2. Descripción del servicio
            </h2>
            <p className="mb-4 text-muted-foreground">
              Cookr es una <strong className="text-foreground">red social gastronómica</strong>{' '}
              que permite a sus usuarios:
            </p>
            <ul className="ml-5 list-disc space-y-1.5 text-muted-foreground">
              <li>Descubrir, crear, compartir y guardar recetas de cocina</li>
              <li>Gestionar una despensa virtual con ingredientes y caducidades</li>
              <li>
                Recibir sugerencias personalizadas mediante un{' '}
                <strong className="text-foreground">asistente de inteligencia artificial</strong>{' '}
                (Google Gemini) que conoce el contenido de tu despensa
              </li>
              <li>Consultar información nutricional automática de cada receta (Edamam API)</li>
              <li>Unirse a grupos temáticos y seguir a otros cocineros</li>
              <li>Activar el Modo Manos Libres para escuchar los pasos de una receta en voz alta</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              El servicio se ofrece en formato de aplicación web progresiva (PWA), instalable
              en dispositivos móviles y accesible también desde navegadores de escritorio.
            </p>
          </section>

          {/* 3 */}
          <section id="cuenta">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              3. Tu cuenta
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Puedes registrarte con <strong className="text-foreground">correo electrónico
                y contraseña</strong> o mediante{' '}
                <strong className="text-foreground">Google OAuth</strong>. Eres responsable
                de mantener la confidencialidad de tus credenciales.
              </p>
              <p>
                Debes proporcionar información veraz y mantenerla actualizada. Nos reservamos
                el derecho a suspender o eliminar cuentas que violen estos términos, suplanten
                identidades o proporcionen información falsa.
              </p>
              <p>
                Puedes eliminar tu cuenta en cualquier momento desde los ajustes. Consulta
                nuestra{' '}
                <Link href="/privacidad" className="text-brand hover:underline">
                  Política de privacidad
                </Link>{' '}
                para saber qué ocurre con tus datos tras la eliminación.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section id="contenido">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              4. Contenido del usuario
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Al publicar recetas, imágenes, comentarios u otro contenido en Cookr,
                conservas la <strong className="text-foreground">propiedad</strong> sobre
                ese contenido, pero nos concedes una licencia mundial, no exclusiva y
                gratuita para mostrarlo, almacenarlo y distribuirlo dentro de la plataforma.
              </p>
              <p>
                Eres el único responsable del contenido que publicas. No debes subir
                contenido que:
              </p>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>Infrinja derechos de autor, marcas u otros derechos de terceros</li>
                <li>Sea falso, engañoso o contenga información nutricional incorrecta a sabiendas</li>
                <li>Sea ofensivo, discriminatorio, violento o sexualmente explícito</li>
                <li>Contenga malware, enlaces de phishing u otro contenido malicioso</li>
                <li>Viole cualquier ley o regulación aplicable</li>
              </ul>
              <p>
                Nos reservamos el derecho a retirar cualquier contenido que incumpla estas
                normas, sin previo aviso y sin responsabilidad.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section id="uso-aceptable">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              5. Uso aceptable
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 p-4">
                <p className="mb-3 font-semibold text-foreground">✅ Permitido</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>Crear y compartir recetas propias</li>
                  <li>Seguir e interactuar con otros usuarios</li>
                  <li>Usar el asistente de IA para planificar comidas</li>
                  <li>Guardar recetas de otros usuarios para uso personal</li>
                  <li>Participar en grupos gastronómicos</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <p className="mb-3 font-semibold text-foreground">🚫 Prohibido</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>Hacer scraping o extracción masiva de datos</li>
                  <li>Crear cuentas falsas o bots automatizados</li>
                  <li>Acceder a cuentas de otros usuarios sin permiso</li>
                  <li>Usar la API con fines comerciales sin autorización</li>
                  <li>Realizar ataques o sobrecargar los servidores</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6 */}
          <section id="ia">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              6. Asistente de inteligencia artificial
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                El asistente culinario de Cookr está impulsado por{' '}
                <strong className="text-foreground">Google Gemini</strong>. Las respuestas
                generadas son <strong className="text-foreground">orientativas</strong> y
                pueden contener imprecisiones, especialmente en materia de:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Información nutricional o calórica</li>
                <li>Alergias e intolerancias alimentarias</li>
                <li>Tiempos de cocción seguros para carnes y pescados</li>
                <li>Compatibilidad de ingredientes con condiciones médicas</li>
              </ul>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
                <strong className="text-foreground">Importante:</strong> No uses las
                recomendaciones del asistente de IA como sustituto de consejo médico o
                dietético profesional. Consulta siempre a un especialista para información
                relacionada con salud, alergias o condiciones médicas.
              </div>
              <p>
                Los mensajes enviados al asistente de IA son procesados por los servidores
                de Google. Consulta la{' '}
                <a
                  href="https://ai.google.dev/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  política de uso de Google AI
                </a>{' '}
                para más información.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section id="propiedad">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              7. Propiedad intelectual
            </h2>
            <p className="text-muted-foreground">
              El código fuente, el diseño, los logotipos y los textos de Cookr son
              propiedad del autor del TFG y están protegidos por la legislación de
              propiedad intelectual aplicable. No puedes reproducir, distribuir ni crear
              obras derivadas sin autorización expresa, excepto cuando sea necesario para
              el uso normal de la plataforma. Las recetas publicadas por los usuarios
              pertenecen a sus autores respectivos.
            </p>
          </section>

          {/* 8 */}
          <section id="disponibilidad">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              8. Disponibilidad del servicio
            </h2>
            <p className="text-muted-foreground">
              Cookr se ofrece «tal cual» y «según disponibilidad». Al tratarse de un
              proyecto académico, no garantizamos una disponibilidad del 100 % ni un
              tiempo de respuesta de soporte determinado. Podemos interrumpir, modificar o
              discontinuar cualquier parte del servicio en cualquier momento, especialmente
              al término del período académico del TFG.
            </p>
          </section>

          {/* 9 */}
          <section id="responsabilidad">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              9. Limitación de responsabilidad
            </h2>
            <p className="text-muted-foreground">
              En la máxima medida permitida por la ley aplicable, Cookr y su autor no
              serán responsables de:
            </p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5 text-muted-foreground">
              <li>Daños derivados del uso o la imposibilidad de uso del servicio</li>
              <li>Pérdida de datos, recetas o contenido publicado</li>
              <li>Decisiones tomadas a partir de las recomendaciones del asistente de IA</li>
              <li>Problemas de salud derivados de seguir recetas publicadas en la plataforma</li>
              <li>Interrupciones del servicio debidas a causas ajenas a nuestro control</li>
            </ul>
          </section>

          {/* 10 */}
          <section id="cambios">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              10. Cambios en los términos
            </h2>
            <p className="text-muted-foreground">
              Podemos actualizar estos términos en cualquier momento. Notificaremos los
              cambios sustanciales por correo electrónico o mediante un aviso en la
              aplicación con al menos <strong className="text-foreground">7 días</strong>{' '}
              de antelación. El uso continuado del servicio tras ese período implica la
              aceptación de los nuevos términos.
            </p>
          </section>

          {/* 11 */}
          <section id="contacto">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              11. Contacto
            </h2>
            <p className="text-muted-foreground">
              Si tienes preguntas sobre estos términos o quieres reportar contenido que
              incumpla estas normas, puedes contactarnos a través del{' '}
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
            <Link href="/privacidad" className="text-muted-foreground hover:text-brand transition-colors">
              Política de privacidad
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
