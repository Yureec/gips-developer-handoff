import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    colorScheme: 'light',
    locale: 'ru-RU',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [{
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  }, {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174/tests/fixtures/progress.html',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  }],
  projects: [
    {
      name: 'chrome-1920',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'chrome-1366',
      use: { viewport: { width: 1366, height: 768 } },
    },
  ],
});
