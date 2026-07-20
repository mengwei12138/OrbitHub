import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { compression } from 'vite-plugin-compression2';

import globAlias from './plugins/vite-plugin-glob-alias';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const deps = Object.keys(pkg.dependencies || {});

const VENDOR_MAP: Record<string, string> = {
  '@tanstack/react-query': 'query-vendor',
  axios: 'axios-vendor',
  zustand: 'state-vendor',
  'lodash-es': 'utils-vendor',
  classnames: 'utils-vendor',
  dashjs: 'video-dash',
  'hls.js': 'video-hls',
  plyr: 'video-plyr',
};

const CORE_VENDORS = ['react', 'react-dom', 'react-router-dom'];
const UI_VENDORS = [
  'antd',
  '@ant-design/icons',
  '@ant-design/pro-components',
  '@ant-design/charts',
];

function getOptimizeInclude(): string[] {
  return deps;
}

function getManualChunks() {
  return (id: string) => {
    if (!id.includes('node_modules')) return;

    for (const [name, chunk] of Object.entries(VENDOR_MAP)) {
      if (id.includes(name)) return chunk;
    }

    if (CORE_VENDORS.some((v) => id.includes(v))) return 'react-vendor';
    if (UI_VENDORS.some((v) => id.includes(v))) return 'antd-vendor';

    return 'vendor';
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devPort = Number(env.VITE_DEV_PORT) || 8010;

  return {
    plugins: [
      globAlias(),
      react({
        exclude: ['**/routes/**'],
      }),
      compression({
        algorithms: ['gzip', 'brotliCompress'],
      }),
    ],
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: devPort,
      host: '127.0.0.1',
      allowedHosts: ['hotel.nat300.top', '.nat300.top'],
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:9',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      entries: ['index.html'],
      include: getOptimizeInclude(),
    },
    build: {
      outDir: 'build',
      target: 'es2020',
      chunkSizeWarningLimit: 500,
      cssCodeSplit: true,
      sourcemap: false,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[hash:10].js',
          chunkFileNames: 'static/js/[hash:10].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.css$/u.test(name)) return 'static/css/[hash:10][extname]';
            if (/\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/u.test(name))
              return 'static/image/[hash:10][extname]';
            if (/\.(?:woff|woff2|eot|ttf|otf)$/u.test(name))
              return 'static/font/[hash:10][extname]';
            return 'static/[hash:10][extname]';
          },
          manualChunks: getManualChunks(),
        },
      },
    },
  };
});
