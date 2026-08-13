import { describe, it, expect } from 'vitest'
import { parseBlogPost, blogModules } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'

const entries = Object.entries(blogModules)

describe('真实文章内容', () => {
  it('共 3 篇文章且 frontmatter 完整（title/date/tags/desc）', () => {
    expect(entries).toHaveLength(3)
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

  it('文章正文可安全渲染（无原始 script，正文标题存在）', () => {
    for (const [path, raw] of entries) {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      const post = parseBlogPost(raw, slug)
      const html = renderMarkdown(post.content)
      expect(html).not.toContain('<script>')
      expect(html).toContain(`<h1>${post.title}</h1>`)
    }
  })
})
