import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@solaris/common": fileURLToPath(new URL('../common/src', import.meta.url)),
      "@solaris/map-rendering": fileURLToPath(new URL('../map-rendering/src', import.meta.url))
    },
  },
  build: {
    target: 'es2020',
  },
  server: {
    port: 8080,
    proxy: {
      '/api': process.env.DEV_SERVER_URL || 'http://localhost:3000',
    }
  },
  preview: {
    port: 8080,
  },
  envPrefix: 'VUE_APP'
})
