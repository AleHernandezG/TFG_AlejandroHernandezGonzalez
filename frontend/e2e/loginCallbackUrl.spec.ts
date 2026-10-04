import { test, expect, type Page } from '@playwright/test'
import { CONTRASENA_E2E, crearRecetaPublicada, crearUsuarioVerificado } from './helpers/bd'

// En local el servidor es "next dev" y compila cada página la primera vez que se pide.
const ESPERA_NAVEGACION = 30_000

async function entrar(page: Page, correo: string) {
  await page.getByLabel('Correo electrónico').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(CONTRASENA_E2E)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
}

async function esperarReceta(page: Page, id: string, titulo: string) {
  await expect(page).toHaveURL(new RegExp(`/recetas/${id}$`), { timeout: ESPERA_NAVEGACION })
  await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
}

test('un visitante pulsa me gusta, entra y vuelve a la receta', async ({ page }) => {
  const titulo = `Receta con vuelta ${Date.now()}`
  const id = await crearRecetaPublicada(titulo)
  const correo = await crearUsuarioVerificado()

  await page.goto(`/recetas/${id}`)
  await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
  // Mientras la sesión carga, el clic no hace nada a propósito (ficha 0001). Este enlace
  // solo sale cuando ya se sabe que no hay sesión.
  await expect(page.getByRole('link', { name: 'Inicia sesión para comentar' })).toBeVisible({
    timeout: ESPERA_NAVEGACION,
  })
  await page.getByRole('button', { name: 'Me gusta' }).click()
  await expect(page).toHaveURL(
    new RegExp(`/login\\?callbackUrl=${encodeURIComponent(`/recetas/${id}`)}$`),
    { timeout: ESPERA_NAVEGACION },
  )

  await entrar(page, correo)

  await esperarReceta(page, id, titulo)
  await expect(page.getByRole('link', { name: 'Inicia sesión para comentar' })).toHaveCount(0)
})

test('el destino sobrevive a completar el perfil', async ({ page }) => {
  const titulo = `Receta tras el perfil ${Date.now()}`
  const id = await crearRecetaPublicada(titulo)
  const correo = await crearUsuarioVerificado({ perfilCompleto: false })

  await page.goto(`/login?callbackUrl=${encodeURIComponent(`/recetas/${id}`)}`)
  await entrar(page, correo)

  await expect(page).toHaveURL(/\/completar-perfil\?callbackUrl=/, { timeout: ESPERA_NAVEGACION })
  await page.getByRole('button', { name: 'Listo' }).click()

  await esperarReceta(page, id, titulo)
})

test('un callbackUrl externo acaba en /home', async ({ page }) => {
  const correo = await crearUsuarioVerificado()

  await page.goto(`/login?callbackUrl=${encodeURIComponent('https://example.com/robo')}`)
  await entrar(page, correo)

  await expect(page).toHaveURL(/localhost:3000\/home$/, { timeout: ESPERA_NAVEGACION })

  // Con la sesión ya abierta, /completar-perfil redirige con la misma función que el
  // login. Sirve para probar el resto de formas de salir de Cookr sin repetir el login.
  const maliciosos = [
    '//example.com',
    '/\\example.com',
    '/\t/example.com',
    'javascript:alert(1)',
    'example.com',
    '',
  ]
  for (const destino of maliciosos) {
    await page.goto(`/completar-perfil?callbackUrl=${encodeURIComponent(destino)}`)
    await expect(page).toHaveURL(/localhost:3000\/home$/)
  }
})
