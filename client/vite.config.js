import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@solaris-common": path.resolve(__dirname, "../common/src")
    },
  },
  build: {
    target: 'es2020',
  },
  server: {
    port: 8080,
  },
  preview: {
    port: 8080,
  },
  envPrefix: 'VUE_APP'
})
