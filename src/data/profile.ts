export interface Skill {
  name: string
  level: '熟练' | '了解'
}

export interface SocialLink {
  label: string
  url: string
}

export const profile = {
  name: 'xrk-hhh',
  title: '全栈开发 / 算法爱好者',
  introShort: '一名热爱写代码的学生开发者，喜欢把算法思路变成能跑的应用——从游戏到 AI 工具再到 Web。',
  introLong:
    '你好，我是 xrk-hhh，一名计算机相关专业的学生开发者，也是算法竞赛的长期参与者。\n\n' +
    '我享受把想法落地的过程：做过 Java Swing 纵版射击游戏（Galaxy Defender），做过 PySide6 + OpenCV 的 AI 风格迁移桌面应用（Art Style Transfer），也搭过含 14 种 AI 策略的 2048 竞技场（2048 Strategy Arena）。算法与工程的结合是我最感兴趣的方向。\n\n' +
    '这个网站本身也是我的作品：Vue 3 + TypeScript + Three.js + GSAP，从设计文档到 GitHub Pages 自动部署，全程控制在性能预算之内。\n\n' +
    '如果你想聊合作、交流题目或者讨论有意思的项目，欢迎通过邮箱联系我。',
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
  socials: [
    { label: 'GitHub', url: 'https://github.com/xrk-hhh' },
    { label: '邮箱', url: 'mailto:xxjh2487657826@outlook.com' },
  ] as SocialLink[],
} satisfies {
  name: string
  title: string
  introShort: string
  introLong: string
  avatar: string
  skills: Skill[]
  socials: SocialLink[]
}
