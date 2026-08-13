export interface Project {
  slug: string
  title: string
  description: string
  tags: string[]
  image?: string
  github?: string
  demo?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    slug: 'portfolio',
    title: '本网站',
    description: '占位项目：Vue 3 + Three.js + GSAP 个人网站（阶段③替换为真实项目）。',
    tags: ['Vue 3', 'TypeScript', 'Three.js'],
    featured: true,
  },
]
