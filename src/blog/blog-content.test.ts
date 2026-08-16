import { describe, it, expect } from 'vitest'
import { parseBlogPost, blogModules } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'

const entries = Object.entries(blogModules)

describe('真实文章内容', () => {
  it('共 33 篇文章且 frontmatter 完整（title/date/tags/desc）', () => {
    expect(entries).toHaveLength(33)
    for (const [path, raw] of entries) {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      const post = parseBlogPost(raw, slug)
      expect(post.title).toBeTruthy()
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.tags.length).toBeGreaterThan(0)
      expect(post.desc).toBeTruthy()
      expect(post.content.trim().length).toBeGreaterThan(0)
    }
  })

  it('文章正文可安全渲染（无原始 script，正文不含重复 h1）', () => {
    for (const [path, raw] of entries) {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      const post = parseBlogPost(raw, slug)
      const html = renderMarkdown(post.content)
      expect(html).not.toContain('<script>')
      // h1 由 BlogPostView 用 post.title 渲染，正文里不应再出现
      expect(html).not.toContain('<h1>')
    }
  })
})
