export interface Skill {
  name: string
  level: '熟练' | '了解'
}

export interface SocialLink {
  label: string
  url: string
}

export const profile = {
  name: '占位名字',
  title: '全栈开发 / 算法爱好者',
  introShort: '一句话简介（阶段③替换为真实内容）',
  introLong:
    '这里是详细简介占位文本。阶段③准备素材后替换。',
  avatar: `${import.meta.env.BASE_URL}images/avatar.webp`,
  skills: [
    { name: 'Vue 3', level: '熟练' },
    { name: 'TypeScript', level: '熟练' },
    { name: 'C++ / 算法', level: '熟练' },
    { name: 'Three.js', level: '了解' },
  ] as Skill[],
  socials: [{ label: 'GitHub', url: 'https://github.com/' }] as SocialLink[],
} satisfies {
  name: string
  title: string
  introShort: string
  introLong: string
  avatar: string
  skills: Skill[]
  socials: SocialLink[]
}
