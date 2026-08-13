import { load } from 'js-yaml'

export interface BlogMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  desc: string
  content: string
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function parseBlogPost(raw: string, slug: string): BlogMeta {
  const match = raw.match(FRONTMATTER_RE)
  const data = match ? ((load(match[1]) as Record<string, unknown>) ?? {}) : {}
  const content = match ? raw.slice(match[0].length) : raw
  if (typeof data.title !== 'string' || !data.title) {
    throw new Error(`[blog] ${slug}: frontmatter 缺少 title`)
  }
  if (typeof data.date !== 'string' && !(data.date instanceof Date)) {
    throw new Error(`[blog] ${slug}: frontmatter 缺少 date`)
  }
  const date =
    data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date)
  return {
    slug,
    title: data.title,
    date,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    desc: typeof data.desc === 'string' ? data.desc : '',
    content,
  }
}

export function listPosts(modules: Record<string, string>): BlogMeta[] {
  return Object.entries(modules)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      return parseBlogPost(raw, slug)
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

// TODO（性能扩展点，Plan §7）：文章数超过 15 篇时，
// 评估 shiki 构建时预编译或按需加载渲染依赖。
export const blogModules = import.meta.glob('../blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
