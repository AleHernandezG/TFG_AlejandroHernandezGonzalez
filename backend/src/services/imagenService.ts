/**
 * imagenService.ts — gestión de imágenes externas.
 * Punto de cambio único: si se sustituye Pexels por otra fuente,
 * solo se toca este fichero (rules.md §2).
 */

const PEXELS_BASE = "https://api.pexels.com/v1";

export interface ResultadoFotoPexels {
  url: string;
  fotografo: string;
  urlFoto: string;   // enlace a la foto en Pexels (licencia obliga a mostrarlo)
  urlPerfil: string; // enlace al perfil del fotógrafo (licencia obliga a mostrarlo)
}

export async function buscarFotoPexels(
  query: string
): Promise<ResultadoFotoPexels | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      query,
      per_page: "1",
      orientation: "landscape",
    });

    const res = await fetch(`${PEXELS_BASE}/search?${params}`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      photos: {
        src: { large2x: string; large: string };
        photographer: string;
        url: string;
        photographer_url: string;
      }[];
    };

    const foto = data.photos?.[0];
    if (!foto) return null;

    return {
      url: foto.src.large2x || foto.src.large,
      fotografo: foto.photographer,
      urlFoto: foto.url,
      urlPerfil: foto.photographer_url,
    };
  } catch {
    return null;
  }
}
