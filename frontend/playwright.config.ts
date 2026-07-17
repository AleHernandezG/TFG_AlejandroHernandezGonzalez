import { defineConfig, devices } from '@playwright/test'

const esCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: esCI,
  retries: esCI ? 2 : 0,
  reporter: esCI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command: 'npm --prefix ../backend run build && node ../backend/scripts/servidorE2E.js',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: esCI ? 'npm run build && npm run start' : 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 240_000,
      env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:4000/api',
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXTAUTH_SECRET: 'e2e-secret-nextauth',
      },
    },
  ],
})
