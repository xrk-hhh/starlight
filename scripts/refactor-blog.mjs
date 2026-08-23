import fs from 'node:fs'

const p = 'src/lib/blog.ts'
const s = fs.readFileSync(p, 'utf8')

// 1) 替换旧 eager 全文 glob 段
const startMarker = '// TODO'
const endMarker = '}) as Record<string, string>'
const start = s.indexOf(startMarker)
const end = s.indexOf(endMarker)
if (start < 0 || end < 0) { console.error('markers not found'); process.exit(1) }
const newGlob = `// v2.18 性能重构：列表数据与全文分离。
// blogMetas：构建期解析的 frontmatter（vite 插件 ?blogmeta，与 parseBlogPost 输出同构、
// content 为空串）——列表/统计/今日一题/上下篇全部走这里，36 篇全文不再进列表路径，
// 运行时也不再需要 js-yaml。
// blogRaws：全文懒加载（?raw 非 eager），文章页按 slug 取，单篇独立 chunk。
export const blogMetas = import.meta.glob('../blog/*.md', {
  query: '?blogmeta',
  import: 'default',
  eager: true,
}) as Record<string, BlogMeta>

export const blogRaws = import.meta.glob('../blog/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** 列表（同步、零解析）：meta 已在构建期展开，按日期倒序 */
export function listPostMetas(metas: Record<string, BlogMeta>): BlogMeta[] {
  return Object.values(metas).sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** 取单篇全文（懒加载 chunk）；找不到返回 null（404 由调用方处理） */
export async function loadPostRaw(slug: string): Promise<string | null> {
  const hit = blogRaws['../blog/' + slug + '.md']
  return hit ? hit() : null
}`
let out = s.slice(0, start) + newGlob + s.slice(end + endMarker.length)

// 2) 抽离 yaml import + parseBlogPost + listPosts（运行时解析族，仅测试用）
const yamlImport = "import { load } from 'js-yaml'\n"
const parseStart = out.indexOf('export function parseBlogPost')
const parseEnd = out.indexOf('\n}\n', parseStart) + 3
const listStart = out.indexOf('export function listPosts')
const listEnd = out.indexOf('\n}\n', listStart) + 3
if (!out.includes(yamlImport) || parseStart < 0 || listStart < 0) { console.error('sections not found'); process.exit(1) }
const parseFn = out.slice(parseStart, parseEnd)
const listFn = out.slice(listStart, listEnd)
// listPosts 在 parseBlogPost 之后，先删后面的避免索引位移
out = out.replace(listFn, '')
out = out.replace(parseFn, '')
out = out.replace(yamlImport, '')
out = '// parseBlogPost / listPosts（运行时 frontmatter 解析族）已抽至 ./blog-parse——仅测试使用，浏览器包不再携带 js-yaml\n' + out
fs.writeFileSync(p, out)

fs.writeFileSync(
  'src/lib/blog-parse.ts',
  "import { load } from 'js-yaml'\nimport type { BlogMeta } from './blog'\n\n// 运行时版 frontmatter 解析（与 vite.config 构建期插件 ?blogmeta 同构）。\n// v2.18 起浏览器路径不再使用（meta 已在构建期解析），仅测试引用。\n\n" + parseFn + '\n' + listFn,
)
console.log('done')
