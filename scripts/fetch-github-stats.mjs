// 构建时拉取公开仓库统计，写入 public/github-stats.json（由 deploy.yml 在 npm run build 前调用）
// 运行于 GitHub Actions，GITHUB_TOKEN 有 public_repo 读权限；本地手动运行需设置 GH_TOKEN。
import { writeFileSync } from 'node:fs'

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'starlight-site',
  ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {}),
}

async function main() {
  const repoRes = await fetch('https://api.github.com/users/xrk-hhh/repos?per_page=100&type=owner', { headers })
  if (!repoRes.ok) throw new Error(`repos API ${repoRes.status}`)
  const repos = await repoRes.json()
  const mine = repos.filter((r) => !r.fork && !r.archived && r.visibility === 'public')
  const stats = {
    repos: mine.length,
    stars: mine.reduce((s, r) => s + (r.stargazers_count ?? 0), 0),
    updatedAt: new Date().toISOString().slice(0, 10),
  }
  writeFileSync(new URL('../public/github-stats.json', import.meta.url), JSON.stringify(stats, null, 2))
  console.log('[github-stats]', stats)
}

main().catch((e) => {
  console.error('[github-stats] failed:', e.message)
  process.exit(1)
})
