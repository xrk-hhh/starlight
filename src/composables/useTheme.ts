import { ref } from 'vue'

// 多主题系统（v1.9）：不止深浅两套——5 套完整配色，CSS 变量级换肤。
// 主题在 index.html 首帧前由内联脚本应用到 <html data-theme>（防闪色），
// 这里负责运行时切换、持久化与 theme-color 同步。
export interface ThemeDef {
  key: string
  label: string
  hint: string
  swatch: { bg: string; primary: string; accent: string }
}

export const THEMES: ThemeDef[] = [
  {
    key: 'starport',
    label: '深空星港',
    hint: '青紫星海 · 默认',
    swatch: { bg: '#0a0a12', primary: '#22d3ee', accent: '#8b5cf6' },
  },
  {
    key: 'sunset',
    label: '落日熔金',
    hint: '琥珀 × 玫瑰的暖晚霞',
    swatch: { bg: '#120c0a', primary: '#f59e0b', accent: '#f43f5e' },
  },
  {
    key: 'aurora',
    label: '极光冰川',
    hint: '极地夜空的青绿极光',
    swatch: { bg: '#071016', primary: '#2dd4bf', accent: '#60a5fa' },
  },
  {
    key: 'paper',
    label: '月白纸笺',
    hint: '暖纸底色 · 浅色',
    swatch: { bg: '#f5f2ea', primary: '#0f766e', accent: '#7c3aed' },
  },
  {
    key: 'sakura',
    label: '樱庭薄暮',
    hint: '樱粉薄暮 · 浅色',
    swatch: { bg: '#fbf4f7', primary: '#be185d', accent: '#6d28d9' },
  },
]

const STORAGE_KEY = 'starlight:theme'
const current = ref<string>(
  typeof document !== 'undefined' ? document.documentElement.dataset.theme || 'starport' : 'starport',
)

function applyTheme(key: string) {
  const def = THEMES.find((t) => t.key === key) ?? THEMES[0]
  current.value = def.key
  document.documentElement.dataset.theme = def.key
  // 同步浏览器 UI 色（地址栏/状态栏）
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', def.swatch.bg)
  try {
    localStorage.setItem(STORAGE_KEY, def.key)
  } catch {
    /* storage 不可用时静默 */
  }
}

export function useTheme() {
  return { themes: THEMES, current, applyTheme }
}
