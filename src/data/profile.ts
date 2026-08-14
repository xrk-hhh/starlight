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
    '你好，我是 xrk-hhh，一名计算机相关专业的学生开发者。我的日常是把想法变成能跑的东西——从算法竞赛到桌面应用，再到你现在看到的这个网站。\n\n' +
    '最近在做三件事：持续刷算法题保持手感、把这个网站的内容做得更充实（v1.1 内容增强进行中）、探索 AI 应用与前端工程化的结合——Art Style Transfer 的云端+离线双引擎、2048 Arena 的策略进化，都来自这条兴趣线。\n\n' +
    '此前做过几个完整项目：Galaxy Defender（Java Swing 纵版射击 + Roguelike 升级）、Art Style Transfer（PySide6 + OpenCV 风格迁移，六种滤镜、云端/离线双引擎）、2048 Strategy Arena（14 种 AI 策略同台竞技，Bitboard 引擎 74% 胜率）。每个项目都有对应的博客复盘，欢迎翻看。\n\n' +
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
  ] as Skill[],
  // 时间线初稿：日期为占位，待用户确认真实时间
  timeline: [
    { date: '2025', title: 'Galaxy Defender', desc: '第一个完整游戏项目：Java Swing 纵版射击 + Roguelike 升级。' },
    { date: '2026 上半年', title: 'Art Style Transfer', desc: 'PySide6 + OpenCV 桌面应用，六种艺术风格滤镜，云端/离线双引擎。' },
    { date: '2026 上半年', title: '2048 Strategy Arena', desc: '14 种 AI 策略同台竞技，Bitboard 引擎 74% 胜率。' },
    { date: '2026-08', title: '本网站上线', desc: 'Vue 3 + Three.js + GSAP，从设计文档到 GitHub Pages 自动部署。' },
    { date: '现在', title: '进行中', desc: 'v1.1 内容增强 · 持续刷题 · 探索 AI 应用。' },
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
