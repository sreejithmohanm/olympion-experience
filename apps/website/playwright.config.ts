import { defineConfig, devices } from '@playwright/test';

const apiUrl = 'http://127.0.0.1:4000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }]
      ]
    : 'list',
  use: {
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure'
  },
  webServer: [
    {
      command: 'node e2e/mockWorkforceApi.mjs',
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
      url: 'http://127.0.0.1:3000',
      env: { NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL: apiUrl },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3001',
      cwd: '../workforce-console',
      url: 'http://127.0.0.1:3001',
      env: { NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL: apiUrl },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
});
