// 本地验收用的静态服务器（v2.21）
//
// 为什么不用 `vite preview`：
//   1) 它在 Windows 上可能只监听 IPv6 回环（[::1]），而浏览器先解析 IPv4 的 localhost，
//      表现为「服务器没起来」；
//   2) 作为 SPA 预览，它会对未命中的请求回退到 index.html——JS/CSS 请求也会拿到 HTML，
//      浏览器把 HTML 当 JS 解析后静默失败，页面只剩写死在壳里的导航与页脚（白屏假象）。
// 所以这里只服务 dist/ 构建产物，不做回退猜测，并显式校验 MIME。
//
// 用法：node scripts/preview-server.mjs [--port 4173]
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../dist/', import.meta.url)))
const BASE = '/starlight'
const PORT = Number(process.argv[process.argv.indexOf('--port') + 1]) || 4173
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}
// 只允许这些扩展名被静态命中；其余一律按路由交给 404 页面（对齐线上 SPA 行为）
const TYPES_EXT = new Set(Object.keys(TYPES))

http
  .createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      if (p.startsWith(BASE)) p = p.slice(BASE.length) || '/'
      if (p === '/' || p === '') p = '/index.html'

      const file = normalize(join(ROOT, p))
      const ext = extname(file).toLowerCase()
      // 已知静态扩展名 → 命中则给正确 MIME，未命中给 404 状态（不回退 index.html）
      const isAsset = TYPES_EXT.has(ext)
      let body = null
      let status = 200
      let outExt = ext
      if (isAsset) {
        try {
          body = await readFile(file)
        } catch {
          status = 404
          outExt = '.txt'
          body = Buffer.from('404 not found: ' + p)
        }
      } else {
        // 无扩展名的路由：交给应用外壳（线上 SPA 行为），但 404.html 仍可被直接命中
        try {
          body = await readFile(file)
        } catch {
          try {
            body = await readFile(file + '.html')
            outExt = '.html'
          } catch {
            body = await readFile(join(ROOT, '404.html'))
            outExt = '.html'
            status = 404
          }
        }
      }
      res.writeHead(status, {
        'content-type': TYPES[outExt] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      })
      res.end(body)
    } catch (e) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(String(e))
    }
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log('static server on http://127.0.0.1:' + PORT + BASE + '/')
    console.log('（只服务 dist/ 构建产物，静态资源不命中即 404，不做 SPA 回退）')
  })
