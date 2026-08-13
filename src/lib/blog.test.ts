import { describe, it, expect } from 'vitest'
import { parseBlogPost, listPosts } from './blog'

const sample = `---
title: 你好，世界
date: 2026-08-13
tags: [生活]
desc: 第一篇博客
---

# 正文

内容。`

describe('parseBlogPost', () => {
  it('解析 frontmatter 与正文', () => {
    const post = parseBlogPost(sample, '2026-08-13-hello')
    expect(post.slug).toBe('2026-08-13-hello')
    expect(post.title).toBe('你好，世界')
    expect(post.date).toBe('2026-08-13')
    expect(post.tags).toEqual(['生活'])
    expect(post.desc).toBe('第一篇博客')
    expect(post.content).toContain('# 正文')
  })

  it('缺少 title 时抛出错误', () => {
    const bad = `---\ndate: 2026-08-13\n---\n正文`
    expect(() => parseBlogPost(bad, 'x')).toThrow(/title/)
  })
})

describe('listPosts', () => {
  it('按 date 倒序排列', () => {
    const posts = listPosts({
      'a.md': sample,
      'b.md': `---\ntitle: 更早\ndate: 2025-01-01\ndesc: 二\n---\n`,
    })
    expect(posts.map((p) => p.date)).toEqual(['2026-08-13', '2025-01-01'])
  })
})
