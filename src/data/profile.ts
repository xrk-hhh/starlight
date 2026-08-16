export interface Skill {
  name: string
  level: '熟练' | '了解'
}

export interface SocialLink {
  label: string
  url: string
}

export interface QuickFact {
  label: string
  value: string
}

export interface TimelineItem {
  date: string
  title: string
  desc: string
}

export interface NowItem {
  doing: string[]
  reading: string[]
  learning: string[]
  next: string[]
}

export const profile = {
  name: 'xrk-hhh',
  title: '全栈开发 / 算法爱好者',
  motto: '把想法变成能跑的东西。',
  introShort: '一名热爱写代码的学生开发者，喜欢把算法思路变成能跑的应用——从游戏到 AI 工具再到 Web。',
  typedPhrases: ['写代码', '刷算法', '折腾前端', '做点有意思的东西'],
  introLong:
    '你好，我是 xrk-hhh，一名计算机相关专业的学生开发者。我对 ACM-XCPC 一类的算法竞赛很感兴趣，日常在洛谷和牛客上刷题，目前最好的成绩是蓝桥杯 C++ B 组全国二等奖。\n\n' +
    '日常开发中我大量使用 AI Agent 辅助：主力是 deepseek-v4-pro 这类 LLM 搭配 Claude Code 这样的 Agent——模型负责推理与代码生成，Agent 提供终端、文件系统与浏览器的操作能力；最近在研究 deepseek harness + deepseek-v4-flash 的轻量组合，用更低的成本跑通「规划-执行-审查」的自动循环。长任务先写设计文档、拆成带验收标准的小任务，逐个实现、逐个用截图做视觉验收——这个网站就是这套工作流的产物。\n\n' +
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
    { name: 'AI Agent 工作流', level: '熟练' },
    { name: 'Three.js', level: '了解' },
    { name: 'Tailwind CSS', level: '了解' },
    { name: '数学建模', level: '了解' },
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
  quickFacts: [
    { label: 'TECH', value: 'Vue · TS · Three.js · Python · Java' },
    { label: 'FOCUS', value: '算法 · 数模 · AI Agent' },
    { label: 'NOW', value: '数模 · 数竞赛备战中' },
    { label: 'UPDATED', value: '2026-08' },
  ] as QuickFact[],
  // /now 星港日志（v1.8）：改这里即可更新「现在」页
  now: {
    doing: [
      '备战数模（高教社杯）与数竞（CMC 非数学 A）',
      'deepseek harness 研究与使用：搭配 deepseek-v4-flash 跑轻量 agent 循环',
      '洛谷 / 牛客竞赛保持手感，整理算法复盘系列',
    ],
    reading: ['数学建模算法与应用（司守奎）', 'Vue 3 官方文档（响应式原理）'],
    learning: [
      '数学建模：线性规划、评价模型与 LaTeX 论文排版',
      'CMC 非数学类：微积分 / 线性代数 / 概率论 重难点',
      'deepseek harness + deepseek-v4-flash 工作流编排',
    ],
    next: ['高教社数模国赛', 'CMC 决赛', '数论与组合数学复盘系列文章'],
  } as NowItem,
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
  quickFacts: QuickFact[]
  now: NowItem
}
