export interface Skill {
  name: string
  level: '熟练' | '了解'
}

export interface SocialLink {
  label: string
  url: string
}

export interface TimelineItem {
  date: string
  title: string
  desc: string
}

export const profile = {
  name: 'xrk-hhh',
  title: '全栈开发 / 算法爱好者',
  motto: '把想法变成能跑的东西。',
  introShort: '一名热爱写代码的学生开发者，喜欢把算法思路变成能跑的应用——从游戏到 AI 工具再到 Web。',
  typedPhrases: ['写代码', '刷算法', '折腾前端', '做点有意思的东西'],
  introLong:
    '你好，我是 xrk-hhh，一名计算机相关专业的学生开发者。我对 ACM-XCPC 一类的算法竞赛很感兴趣，日常在洛谷和牛客上刷题（ID 都是 xrk_hhh），目前最好的成绩是蓝桥杯 C++ B 组全国二等奖。\n\n' +
    '日常开发中我大量使用 AI Agent 辅助——Claude Code 这类工具已经是我工作流的核心：这个网站从设计文档到任务实现、审查、部署上线，全程由 AI Agent 驱动完成。\n\n' +
    '2026 年上半年的产出：6 月完成了 Galaxy Defender（Java Swing 纵版射击 + Roguelike 升级）和 Art Style Transfer（PySide6 + OpenCV 风格迁移，云端/离线双引擎）；7 月完成了 2048 Strategy Arena（14 种 AI 策略同台竞技，Bitboard 引擎 74% 胜率）。每个项目都有对应的博客复盘，欢迎翻看。\n\n' +
    '代码之外：喜欢拆解技术原理、折腾编辑器与系统配置。如果你也在刷题，或者做着什么有意思的小项目，欢迎通过邮箱找我交流。',
  avatar: `${import.meta.env.BASE_URL}images/avatar.webp`,
  skills: [
    { name: 'Java', level: '熟练' },
    { name: 'Python', level: '熟练' },
    { name: 'Vue 3', level: '熟练' },
    { name: 'TypeScript', level: '熟练' },
    { name: 'C++', level: '熟练' },
    { name: '算法与数据结构', level: '熟练' },
    { name: 'Three.js', level: '了解' },
    { name: 'Tailwind CSS', level: '了解' },
    { name: 'AI Agent 开发', level: '熟练' },
  ] as Skill[],
  timeline: [
    { date: '2026-06', title: '蓝桥杯 C++ B 组 · 国二', desc: '目前最好的算法竞赛成绩；对 ACM-XCPC 类竞赛保持兴趣，日常在洛谷/牛客刷题。' },
    { date: '2026-06', title: 'Galaxy Defender', desc: '第一个完整游戏项目：Java Swing 纵版射击 + Roguelike 升级。' },
    { date: '2026-06', title: 'Art Style Transfer', desc: 'PySide6 + OpenCV 桌面应用，六种艺术风格滤镜，云端/离线双引擎。' },
    { date: '2026-07', title: '2048 Strategy Arena', desc: '14 种 AI 策略同台竞技，Bitboard 引擎 74% 胜率。' },
    { date: '2026-08', title: '本网站上线', desc: 'Vue 3 + Three.js + GSAP，AI Agent 驱动开发，GitHub Pages 自动部署。' },
    { date: '现在', title: '进行中', desc: 'v1.1 内容增强 · 洛谷/牛客刷题 · 用 AI Agent 探索更多可能。' },
  ] as TimelineItem[],
  socials: [
    { label: 'GitHub', url: 'https://github.com/xrk-hhh' },
    { label: '邮箱', url: 'mailto:xxjh2487657826@outlook.com' },
  ] as SocialLink[],
} satisfies {
  name: string
  title: string
  motto: string
  introShort: string
  typedPhrases: string[]
  introLong: string
  avatar: string
  skills: Skill[]
  timeline: TimelineItem[]
  socials: SocialLink[]
}
