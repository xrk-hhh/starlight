import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/starlight/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // 首屏小 chunk 合并：减少 slow-4G 下请求数（LCP 优化）。按需分包（ParticleScene/BlogPostView 等）不受影响
        advancedChunks: {
          groups: [
            {
              name: 'app-utils',
              priority: 20,
              test: /(useApi|particles|preload-helper|_plugin-vue_export-helper|profile)/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
