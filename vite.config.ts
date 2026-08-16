import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/starlight/',
  plugins: [
    vue(),
    tailwindcss(),
    // dev：把生产子路径 /starlight/* 重写回根路径，
    // 博文里的绝对图片链接（/starlight/images/…）本地预览时也能显示
    {
      name: 'starlight-base-rewrite-dev',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/starlight')) req.url = req.url.slice('/starlight'.length) || '/'
          next()
        })
      },
    },
  ],
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
