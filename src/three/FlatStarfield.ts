import { resolveParticleCount, audioLevel, type ParticleDensity } from '@/stores/particles'

// 浅色主题星空（v2.13.1）：2D Canvas 渲染的「墨点星野」。
// 缘起：WebGL 星海用加色混合（深色主题发光星海），而透明画布上的 NormalBlending
// 在部分环境实测零输出（预乘三件套/朴素组合均不可见），不再让浅色主题依赖 WebGL。
// 这里用最朴素可靠的 2D 绘制：深色墨点 + 柔边 + 低频闪烁，浅底上清晰可辨。
// 遵守与 WebGL 层相同的约束：移动端/密度 off 不渲染、reduced-motion 静态一帧、
// 页面隐藏暂停；深色主题由 ParticleBackground 停用本层。
interface FlatStar {
  x: number
  y: number
  r: number
  phase: number
  speed: number
  /** 色板索引（0/1 主双色，2 暖点缀），setTheme 换色时按索引重涂 */
  ci: number
  baseAlpha: number
}

export class FlatStarfield {
  private ctx: CanvasRenderingContext2D | null = null
  private stars: FlatStar[] = []
  private rafId = 0
  private t0 = performance.now()
  private colors: [string, string, string] = ['#0f766e', '#7c3aed', '#d97706']
  private reducedMotion = false
  private active = false
  private disposed = false
  private onResizeBound = () => this.rebuild()
  private onVisibilityBound = () => this.onVisibility()

  constructor(private canvas: HTMLCanvasElement) {}

  /** 主题色板（与 useTheme.scene 同源）；切主题时按索引重涂，不重建位置 */
  setTheme(colorA: string, colorB: string, warm: string): void {
    this.colors = [colorA, colorB, warm]
    if (this.reducedMotion) this.drawStatic()
  }

  start(density: ParticleDensity, isMobile: boolean, reducedMotion: boolean): void {
    if (this.disposed) return
    this.reducedMotion = reducedMotion
    const count = resolveParticleCount(density, isMobile)
    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx || count <= 0) {
      this.stop()
      return
    }
    this.active = true
    this.rebuild()
    window.addEventListener('resize', this.onResizeBound)
    document.addEventListener('visibilitychange', this.onVisibilityBound)
    if (this.reducedMotion) {
      this.drawStatic()
    } else {
      this.t0 = performance.now()
      this.loop()
    }
  }

  stop(): void {
    this.active = false
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.onResizeBound)
    document.removeEventListener('visibilitychange', this.onVisibilityBound)
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  dispose(): void {
    this.stop()
    this.disposed = true
    this.ctx = null
    this.stars = []
  }

  private rebuild(): void {
    if (!this.active || !this.ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    this.canvas.width = w * dpr
    this.canvas.height = h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // 星数与 WebGL 层同预算（300/1000），浅色下墨点更醒目，取 60% 即可观感相当
    const count = Math.round((w * h) / 3600) // ~1280×800 → 284 颗；375×667 移动端不启用
    this.stars = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
      ci: Math.random() < 0.08 ? 2 : i % 2,
      baseAlpha: 0.35 + Math.random() * 0.45,
    }))
    if (this.reducedMotion) this.drawStatic()
  }

  private onVisibility(): void {
    if (document.visibilityState === 'visible' && this.active && !this.reducedMotion) {
      this.t0 = performance.now()
      if (!this.rafId) this.loop()
    } else if (document.visibilityState === 'hidden') {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  private drawStatic(): void {
    if (!this.ctx) return
    const w = window.innerWidth
    const h = window.innerHeight
    this.ctx.clearRect(0, 0, w, h)
    for (const s of this.stars) this.drawStar(s, s.baseAlpha)
  }

  private drawStar(s: FlatStar, alpha: number): void {
    const ctx = this.ctx!
    ctx.globalAlpha = alpha
    ctx.fillStyle = this.colors[s.ci]
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
    // 柔边光晕（半径 2.3 倍的极淡同色环）
    ctx.globalAlpha = alpha * 0.18
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r * 2.3, 0, Math.PI * 2)
    ctx.fill()
  }

  private loop = (): void => {
    if (!this.active || this.disposed) return
    this.rafId = requestAnimationFrame(this.loop)
    if (document.visibilityState !== 'visible' || !this.ctx) return
    const t = (performance.now() - this.t0) / 1000
    const audio = audioLevel.value
    const w = window.innerWidth
    const h = window.innerHeight
    this.ctx.clearRect(0, 0, w, h)
    for (const s of this.stars) {
      // 低频闪烁 + 音乐呼吸（与 WebGL 层同源的 audioLevel）
      const tw = 0.72 + 0.28 * Math.sin(t * s.speed + s.phase)
      this.drawStar(s, Math.min(1, s.baseAlpha * tw * (1 + audio * 0.4)))
    }
  }
}
