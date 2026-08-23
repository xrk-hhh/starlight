import { describe, expect, it } from 'vitest'
import { versions } from './versions'
import { SITE_VERSION } from './site'

// 版本星图数据守护（v2.15）：历史上版本条目出现过三次编辑错位（改名吞条目/顺序跳乱/
// 漏 date 字段），此测试在 CI 拦截同类事故——发版只允许「顶部插入新条目」。
function semver(v: string): [number, number, number] {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(v)
  if (!m) throw new Error(`非法版本号格式: ${v}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

describe('版本星图数据', () => {
  it('首条即当前版本（SITE_VERSION）', () => {
    expect(versions[0]?.v).toBe(SITE_VERSION)
  })

  it('严格降序排列（v2.13.0 错位事故防护）', () => {
    for (let i = 1; i < versions.length; i++) {
      const prev = semver(versions[i - 1].v)
      const cur = semver(versions[i].v)
      const ok =
        prev[0] > cur[0] ||
        (prev[0] === cur[0] && (prev[1] > cur[1] || (prev[1] === cur[1] && prev[2] > cur[2])))
      if (!ok) {
        throw new Error(`顺序错位: ${versions[i - 1].v} 应排在 ${versions[i].v} 之后（index ${i - 1}/${i}）`)
      }
    }
  })

  it('版本号无重复（改名吞条目事故防护）', () => {
    const seen = new Set<string>()
    for (const entry of versions) {
      if (seen.has(entry.v)) throw new Error(`重复版本条目: ${entry.v}`)
      seen.add(entry.v)
    }
  })

  it('每条都有非空 date 与 note（漏字段事故防护）', () => {
    for (const entry of versions) {
      expect(entry.date, `${entry.v} 缺 date`).toMatch(/^\d{4}-\d{2}$/)
      expect(entry.note.length, `${entry.v} note 为空`).toBeGreaterThan(4)
    }
  })
})
