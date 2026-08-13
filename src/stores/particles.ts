import { reactive } from 'vue'

export type ParticleDensity = 'high' | 'low' | 'off'

// 纯 Vue reactive 单例（非 Pinia），由 router.afterEach 写入
export const particlesState = reactive({
  density: 'low' as ParticleDensity,
})

const DENSITY_COUNT: Record<ParticleDensity, number> = {
  high: 1000,
  low: 300,
  off: 0,
}

export function resolveParticleCount(density: ParticleDensity, isMobile: boolean): number {
  if (isMobile) return 0
  return DENSITY_COUNT[density]
}
