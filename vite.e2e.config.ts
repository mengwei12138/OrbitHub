import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import globAlias from './plugins/vite-plugin-glob-alias';

export default defineConfig({
  plugins: [globAlias(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5199,
    host: '127.0.0.1',
    strictPort: true,
  },
  root: path.resolve(__dirname, 'e2e/harness'),
  publicDir: false,
});
