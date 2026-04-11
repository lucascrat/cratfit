import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' atualiza o SW em background sem interromper o usuário
      registerType: 'autoUpdate',
      // Não gera manifest próprio — usa o public/manifest.json existente
      manifest: false,
      workbox: {
        // Cacheia assets estáticos (JS, CSS, fontes, imagens)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webm,woff,woff2}'],
        // Limite de tamanho de arquivo para pré-cache (5MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Estratégia para chamadas de API: Network First (sempre tenta a rede)
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 2 },
              networkTimeoutSeconds: 5,
            },
          },
          // Fontes do Google: Cache First
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        // Habilita o service worker em desenvolvimento para testes
        enabled: false,
      },
    }),
  ],
  base: '/',
  server: {
    watch: {
      ignored: ['**/android/**', '**/ios/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-state':   ['zustand', '@tanstack/react-query'],
          'vendor-motion':  ['framer-motion'],
          'vendor-maps':    ['leaflet', 'react-leaflet', '@googlemaps/js-api-loader', '@vis.gl/react-google-maps'],
          'vendor-i18n':    ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-icons':   ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
