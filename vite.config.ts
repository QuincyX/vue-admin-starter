import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

import { adminApiMockPlugin } from './server/admin-api-mock.ts'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version: string; description: string }

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Only the app title is needed at build time; runtime configuration still comes
  // from src/config/env.ts (which validates it with Zod).
  const env = loadEnv(mode, process.cwd(), '')
  const appTitle = env.VITE_APP_TITLE?.trim() || 'Aurora Admin'
  // `pnpm dev:proxy` talks to a real backend on the same origin. The target is
  // intentionally not prefixed with VITE_ so it never reaches the client bundle.
  const isProxyMode = mode === 'proxy'
  const proxyTarget = env.API_PROXY_TARGET?.trim() || 'http://127.0.0.1:3000'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      vueDevTools(),
      // The local auth mock and a real backend proxy are mutually exclusive.
      ...(isProxyMode ? [] : [adminApiMockPlugin()]),
      // PWA is opt-in per project: the manifest ships with the starter so a
      // product can rename it in one place (VITE_APP_TITLE) instead of
      // rediscovering the icon/`start_url`/service-worker requirements.
      VitePWA({
        registerType: 'autoUpdate',
        // Registration is scheduled from `src/main.ts` after `load` + idle.
        // The plugin must not inject its own script, or registration and
        // precaching run while the first screen is still downloading.
        injectRegister: null,
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/maskable-192.png',
          'icons/maskable-512.png',
        ],
        manifest: {
          id: '/',
          name: `${appTitle} · 管理后台`,
          short_name: appTitle,
          description: packageJson.description,
          start_url: '/?source=pwa',
          scope: '/',
          display: 'standalone',
          background_color: '#fbfbfd',
          theme_color: '#fbfbfd',
          lang: 'zh-CN',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: '/icons/maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          // API calls must never be served from the precache.
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        },
        // A service worker in dev hides HMR updates and confuses E2E; test it with
        // `pnpm build && pnpm preview` instead.
        devOptions: { enabled: false },
      }),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      ...(isProxyMode
        ? {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    build: {
      reportCompressedSize: false,
      // ECharts is ~550 kB minified and already isolated in its own chunk above;
      // this limit only silences the warning for a split we have already made.
      chunkSizeWarningLimit: 700,
      // ECharts is ~500 kB minified; keeping it in its own chunk means the shell,
      // the login page and the tables never download it, and the dashboard can cache
      // it independently of application code.
      rolldownOptions: {
        output: {
          advancedChunks: {
            groups: [{ name: 'echarts', test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/ }],
          },
        },
      },
    },
  }
})
