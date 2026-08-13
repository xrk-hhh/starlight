import { onUnmounted, watch, type Ref } from 'vue'
import gsap from 'gsap'

export function useGsapReveal(
  scope: Ref<HTMLElement | null>,
  options: { y?: number; stagger?: number } = {},
) {
  const { y = 40, stagger = 0.1 } = options
  let ctx: gsap.Context | null = null
  let observer: IntersectionObserver | null = null

  function setup(el: HTMLElement) {
    ctx = gsap.context(() => {
      const items = el.querySelectorAll('[data-reveal]')
      gsap.set(items, { opacity: 0, y })
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const target = entry.target as HTMLElement
            const index = Number(target.dataset.index ?? 0)
            gsap.to(target, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              delay: index * stagger,
            })
            observer?.unobserve(target) // 进入一次即停
          }
        },
        { threshold: 0.1 },
      )
      items.forEach((el, i) => {
        ;(el as HTMLElement).dataset.index = String(i)
        observer?.observe(el)
      })
    }, el)
  }

  watch(scope, (el) => {
    if (el) setup(el)
  })

  onUnmounted(() => {
    observer?.disconnect()
    ctx?.revert()
  })
}
