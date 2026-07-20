import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import globAlias from './plugins/vite-plugin-glob-alias';

export default defineConfig({
  plugins: [globAlias(), react()],
  test: {
    // 与 Jenkins 等 UTC 环境一致：日期断言按中国时区（示例见 formatDateTimeMinute）
    env: { TZ: 'Asia/Shanghai' },
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/vitest-setup.ts'],
    // Playwright e2e 的 *.spec.ts 由 Playwright runner 跑；vitest 默认会扫到 e2e/ 下的同名后缀，需显式排除。
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    // 默认 5s 在 196 个 .test 文件并行 + coverage 插桩下，重 integration 测试会偶发超时；
    // 提至 15s 让 titleInput/datacenter 等场景留有余量，真正卡死的用例仍能被识别
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
