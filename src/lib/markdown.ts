import MarkdownIt from 'markdown-it'
import { fromHighlighter } from '@shikijs/markdown-it/core'
import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import type { BundledLanguage } from 'shiki'

const md = new MarkdownIt({
  html: false, // 安全：不渲染原始 HTML（XSS 防线）
  linkify: true,
})

// shiki 在模块加载时初始化；本模块仅被 BlogPostView（懒加载路由）引用，
// 因此 shiki 与语法包只进入博客详情页 chunk，不进入首屏。
// 采用 shiki/core 细粒度集成（官方 fine-grained bundle 推荐形态）：
// 只注册文章实际用到的语言，避免 bundle-full 把全部内置语言打进产物。
const highlighter = await createHighlighterCore({
  themes: [import('@shikijs/themes/github-dark')],
  langs: [import('@shikijs/langs/python')],
  engine: createOnigurumaEngine(() => import('shiki/wasm')),
})

md.use(
  fromHighlighter(
    // @shikijs/markdown-it 的 HighlighterGeneric 与 HighlighterCore
    // 存在泛型不变性冲突（"Type 'any' is not assignable to type 'never'"），
    // 属 @shikijs/markdown-it@4 边界的已知类型噪声，运行时同源。
    highlighter as unknown as Parameters<typeof fromHighlighter>[0],
    {
      theme: 'github-dark',
      // 'text' 是 shiki 运行时的特殊纯文本语言（isPlainLang 白名单），
      // 但未收录进 BundledLanguage 类型联合，此处显式断言。
      // 未注册的语言由此优雅降级为纯文本，不抛错。
      fallbackLanguage: 'text' as BundledLanguage,
    },
  ),
)

export function renderMarkdown(src: string): string {
  return md.render(src)
}
