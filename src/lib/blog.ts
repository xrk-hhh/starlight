import { load } from 'js-yaml'

export interface BlogMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  desc: string
  content: string
  /** 一级分类（算法竞赛/生活/项目/AI…）；缺省时回退到第一个 tag */
  category: string
  /** 难度 1~5 星（v2.6）；非算法文缺省为 0（不显示） */
  difficulty: number
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
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : []
  return {
    slug,
    title: data.title,
    date,
    tags,
    desc: typeof data.desc === 'string' ? data.desc : '',
    content,
    category: typeof data.category === 'string' && data.category ? data.category : tags[0] ?? '',
    difficulty: typeof data.difficulty === 'number' ? Math.min(5, Math.max(1, data.difficulty)) : 0,
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

/** 统计字数：中文按字符计，英文按空格分词计；忽略代码块与 markdown 标记 */
export function countWords(markdown: string): number {
  const noCode = markdown.replace(/```[\s\S]*?```/g, ' ')
  // eslint-disable-next-line no-useless-escape -- \[ 必须保留：V8 实测类内未转义的 [ 会使后续 ] 提前闭合字符类（()!| 被挤出类外），ESLint 判为无用转义属误报
  const noMarkdown = noCode.replace(/[#>*`\-_\[\]()!|]/g, ' ')
  const cjk = (noMarkdown.match(/[\u4e00-\u9fff]/g) ?? []).length
  const latin = (noMarkdown.match(/[a-zA-Z0-9]+/g) ?? []).length
  return cjk + latin
}

/** 阅读时长（分钟，向上取整）：中文 400 字/分，英文 200 词/分（简化：总字数按 400/分） */
export function readingTimeMinutes(markdown: string): number {
  return Math.max(1, Math.ceil(countWords(markdown) / 400))
}

// TODO（性能扩展点，Plan §7）：文章数超过 15 篇时，
// 评估 shiki 构建时预编译或按需加载渲染依赖。
export const blogModules = import.meta.glob('../blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
