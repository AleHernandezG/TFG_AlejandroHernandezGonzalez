import { test, expect, type Page } from '@playwright/test'
import { crearRecetaPublicada } from './helpers/bd'

const PANTALLAS = [
  { nombre: 'escritorio', width: 1440, height: 900 },
  { nombre: 'móvil', width: 390, height: 844 },
]

function vigilarRespuestas401(page: Page): string[] {
  const rechazadas: string[] = []
  page.on('response', (respuesta) => {
    if (respuesta.status() === 401) rechazadas.push(respuesta.url())
  })
  return rechazadas
}

async function abrirSinSesion(page: Page, id: string, titulo: string) {
  await page.goto(`/recetas/${id}`)
  await expect(page).toHaveURL(new RegExp(`/recetas/${id}$`))
  await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Inicia sesión para comentar' })).toBeVisible()
}

for (const pantalla of PANTALLAS) {
  test(`un visitante sin sesión lee una receta y las acciones le llevan al login (${pantalla.nombre})`, async ({ page }) => {
    await page.setViewportSize({ width: pantalla.width, height: pantalla.height })
    const titulo = `Receta pública ${pantalla.nombre} ${Date.now()}`
    const id = await crearRecetaPublicada(titulo)
    const vuelta = new RegExp(`/login\\?callbackUrl=${encodeURIComponent(`/recetas/${id}`)}$`)
    const rechazadas = vigilarRespuestas401(page)

    await abrirSinSesion(page, id, titulo)
    await expect(page.getByText('Pelar las patatas', { exact: false })).toBeVisible()

    await page.getByRole('button', { name: 'Me gusta' }).click()
    await expect(page).toHaveURL(vuelta)

    await abrirSinSesion(page, id, titulo)
    await page.getByRole('button', { name: 'Guardar receta' }).click()
    await expect(page).toHaveURL(vuelta)

    await abrirSinSesion(page, id, titulo)
    await page.getByRole('link', { name: 'Inicia sesión para comentar' }).click()
    await expect(page).toHaveURL(vuelta)

    await abrirSinSesion(page, id, titulo)
    await page.getByRole('button', { name: 'Añadir a mi despensa' }).click()
    await expect(page).toHaveURL(vuelta)

    expect(rechazadas).toEqual([])
  })
}

test('completar el perfil sin sesión lleva al login', async ({ page }) => {
  await page.goto('/completar-perfil')
  await expect(page).toHaveURL(/\/login\?callbackUrl=/)
})
