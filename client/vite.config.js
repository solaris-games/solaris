import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@solaris/common": fileURLToPath(new URL('../common/src', import.meta.url))
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
