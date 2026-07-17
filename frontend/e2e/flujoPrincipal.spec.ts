import { test, expect, type Page } from '@playwright/test'
import { correoUnico, tokenDeVerificacion, contarRecetasDe } from './helpers/bd'

const CONTRASENA = 'Test1234'

async function registrarse(page: Page, correo: string) {
  await page.goto('/registro')
  await page.getByLabel('Nombre completo').fill('Alejandro E2E')
  await page.getByLabel('Correo electrónico').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(CONTRASENA)
  await page.getByLabel('Confirmar contraseña').fill(CONTRASENA)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL(/\/verificar-email\/pendiente/)
}

async function verificarCorreo(page: Page, correo: string) {
  const token = await tokenDeVerificacion(correo)
  await page.goto(`/verificar-email?token=${token}`)
  await expect(page.getByRole('heading', { name: '¡Correo verificado!' })).toBeVisible()
}

async function iniciarSesion(page: Page, correo: string) {
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(CONTRASENA)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
}

async function completarPerfil(page: Page) {
  await expect(page).toHaveURL(/\/completar-perfil/)
  await page.getByRole('button', { name: 'Listo' }).click()
  await expect(page).toHaveURL(/\/home/)
}

async function rellenarReceta(page: Page, titulo: string) {
  await page.goto('/crear-receta')
  await page.getByRole('button', { name: 'Saltar tutorial' }).click()

  await page.getByPlaceholder('Ej. Paella valenciana').fill(titulo)
  await page.getByPlaceholder('Cuéntanos algo sobre esta receta...').fill(
    'Una tortilla de patata jugosa, de las que se hacen en diez minutos.',
  )
  await page.getByPlaceholder('30').fill('25')
  await page.getByPlaceholder('4').fill('2')
  await page.getByRole('button', { name: 'Fácil' }).click()

  await page.getByPlaceholder('Ej. Harina de trigo').first().fill('Patata')
  await page.getByPlaceholder('100').first().fill('300')
  await page.locator('select[name="ingredientes.0.unidad"]').selectOption('g')

  await page
    .getByPlaceholder('Describe este paso con detalle...')
    .first()
    .fill('Pelar las patatas, cortarlas finas y freírlas a fuego suave hasta que estén tiernas.')

  await page.getByRole('button', { name: 'Revisar receta' }).click()
  await expect(page).toHaveURL(/\/crear-receta\/revisar/)
}

test('un usuario nuevo se registra, verifica, entra y publica una receta', async ({ page }) => {
  const correo = correoUnico()
  const titulo = `Tortilla E2E ${Date.now()}`

  await registrarse(page, correo)
  await verificarCorreo(page, correo)
  await iniciarSesion(page, correo)
  await completarPerfil(page)
  await rellenarReceta(page, titulo)

  await page.getByRole('button', { name: 'Publicar receta' }).click()

  await expect(page).toHaveURL(/\/coleccion/)
  await expect(page.getByText(titulo).filter({ visible: true })).toBeVisible()
  expect(await contarRecetasDe(correo)).toBe(1)
})

test('sin verificar el correo no se puede entrar', async ({ page }) => {
  const correo = correoUnico('sinverificar')

  await registrarse(page, correo)
  await iniciarSesion(page, correo)

  await expect(page.getByText(/verificar tu correo/i)).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})
