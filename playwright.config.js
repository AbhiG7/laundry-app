import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  workers: 1, // Serial execution to avoid shared backend state conflicts
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd backend && /home/abhig/go_root/go/bin/go run . &',
      port: 8080,
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
    {
      command: 'PATH="/home/abhig/node18/bin:$PATH" /home/abhig/node18/bin/node frontend/node_modules/.bin/vite --root frontend',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
  ],
})
