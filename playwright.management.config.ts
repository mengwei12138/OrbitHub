import { defineConfig, devices } from '@playwright/test';

/**
 * 后台管理 (PRD §7) e2e 配置。
 *
 * 与默认 playwright.config.ts 的区别：
 * - testDir: ./e2e/management（独立目录，避免和现有的 publish-qr 用例混淆）
 * - webServer: 真实 vite dev，/api 反代到本地 backend (8082)，需要后端已就绪
 * - baseURL: 5200（避开用户开发环境的 8000/8001/8002）
 *
 * 前置：先 `gradlew :boot:bootRun`，确保 http://localhost:8082/api/v1/admin/packages 通。
 */
export default defineConfig({
  testDir: './e2e/management',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // 5200 端口 vite dev 在全套件下偶发首屏 lazy chunk 加载慢，开 1 次重试规避
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    [
      'html',
      { open: 'never', outputFolder: 'e2e/artifacts/management-report' },
    ],
  ],
  outputDir: 'e2e/artifacts/management-results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:5200',
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec vite --port 5200 --strictPort',
    url: 'http://127.0.0.1:5200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_API_PROXY_TARGET: 'http://127.0.0.1:8082',
      VITE_DEV_PORT: '5200',
    },
  },
});
