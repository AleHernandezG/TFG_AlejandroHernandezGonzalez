import { ContenidoVerificacion } from './contenidoVerificacion'

// Server Component — lee searchParams aquí y pasa token como prop.
// Patrón documentado en iniciar.html §11.5: "Token como prop, no como hook".
// Evita useSearchParams() en el Client Component y el error de Suspense boundary.
export default function PaginaVerificarEmail({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  return <ContenidoVerificacion token={searchParams.token ?? null} />
}
