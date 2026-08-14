import * as THREE from 'three'
import vertexShader from './shaders/particles.vert?raw'
import fragmentShader from './shaders/particles.frag?raw'
import { resolveParticleCount, type ParticleDensity } from '@/stores/particles'

export interface ParticleSceneOptions {
  count: number
  colorA: string
  colorB: string
  /** 导航主星数量（默认 6，0 表示不构建） */
  navStars?: number
}

export class ParticleScene {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private points: THREE.Points | null = null
  private material: THREE.ShaderMaterial | null = null
  private geometry: THREE.BufferGeometry | null = null
  private navPoints: THREE.Points | null = null
  private navGeometry: THREE.BufferGeometry | null = null
  private navMaterial: THREE.ShaderMaterial | null = null
  private navCount = 0
  private hoveredIndex: number | null = null
  private colorA = '#22d3ee'
  private colorB = '#8b5cf6'
  private raycaster = new THREE.Raycaster()
  private rafId = 0
  private clock = new THREE.Clock()
  private elapsed = 0
  private renderedStatic = false
  private parallaxTarget = { x: 0, y: 0 }
  private density: ParticleDensity = 'off'
  private isMobile = false
  private pageVisible = true
  private reducedMotion = false
  private disposed = false
  private initialized = false
  private onResizeBound = () => this.onResize()
  private onVisibilityBound = () => this.onVisibility()

  constructor(private canvas: HTMLCanvasElement) {}

  init(options: ParticleSceneOptions): void {
    if (this.initialized) return
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )
    this.camera.position.z = 30

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.colorA = options.colorA
    this.colorB = options.colorB
    this.buildPoints(options.count, options.colorA, options.colorB)
    const navStars = options.navStars ?? 6
    if (navStars > 0) this.buildNavStars(navStars)
    this.applyDensity()

    window.addEventListener('resize', this.onResizeBound)
    document.addEventListener('visibilitychange', this.onVisibilityBound)
    this.onResize()
    this.disposed = false
    this.initialized = true
    this.tick()
  }

  setDensity(density: ParticleDensity): void {
    this.density = density
    this.applyDensity()
  }

  setMobile(isMobile: boolean): void {
    this.isMobile = isMobile
    this.applyDensity()
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced
    if (!reduced) this.renderedStatic = false
  }

  setParallaxTarget(x: number, y: number): void {
    this.parallaxTarget.x = x
    this.parallaxTarget.y = y
  }

  private applyDensity(): void {
    if (!this.points || !this.material) return
    const count = resolveParticleCount(this.density, this.isMobile)
    this.points.visible = count > 0
    // 主星与主粒子同规则隐藏（density off / 移动端）
    if (this.navPoints) {
      this.navPoints.visible = count > 0
      if (!this.navPoints.visible) this.setNavStarHover(null)
    }
    if (count > 0) {
      this.geometry?.setDrawRange(0, count) // 密度分档真实生效（1000/300）
      this.renderedStatic = false // 密度 off→on 恢复时重置静态帧标记（§5.3）
    } else {
      // 清掉上一帧残留画面，防止"冻结星空"（alpha renderer 清为透明）
      this.renderer?.clear()
    }
  }

  private buildPoints(count: number, colorA: string, colorB: string): void {
    if (!this.scene) return
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)
    const drifts = new Float32Array(count)
    const colorMixes = new Float32Array(count)

    // 粒子散布在 60×36×30 的扁盒内，z 居中，相机在 z=30
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 36
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      sizes[i] = Math.random() * 1.6 + 0.4
      radii[i] = Math.random() * 1.2 + 0.2
      speeds[i] = Math.random() * 0.4 + 0.1
      drifts[i] = Math.random() * Math.PI * 2
      colorMixes[i] = Math.random()
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    this.geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
    this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    this.geometry.setAttribute('aDrift', new THREE.BufferAttribute(drifts, 1))
    this.geometry.setAttribute('aColorMix', new THREE.BufferAttribute(colorMixes, 1))

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)
  }

  /** 导航主星：环绕视野中部的环带，可与主粒子共用同一 shader（aHover 控制高亮） */
  private buildNavStars(count: number): void {
    if (!this.scene) return
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)
    const drifts = new Float32Array(count)
    const colorMixes = new Float32Array(count)
    const hovers = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * 18
      positions[i * 3 + 1] = Math.sin(angle) * 6
      positions[i * 3 + 2] = Math.sin(angle) * 10 - 5
      sizes[i] = Math.random() * 0.6 + 2.2 // 2.2~2.8，明显大于背景粒子
      radii[i] = Math.random() * 1.2 + 0.2 // 与主粒子相同的漂移参数
      speeds[i] = Math.random() * 0.4 + 0.1
      drifts[i] = Math.random() * Math.PI * 2
      colorMixes[i] = 0.5
      hovers[i] = 0
    }

    this.navGeometry = new THREE.BufferGeometry()
    this.navGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.navGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    this.navGeometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
    this.navGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    this.navGeometry.setAttribute('aDrift', new THREE.BufferAttribute(drifts, 1))
    this.navGeometry.setAttribute('aColorMix', new THREE.BufferAttribute(colorMixes, 1))
    this.navGeometry.setAttribute('aHover', new THREE.BufferAttribute(hovers, 1))

    this.navMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA: { value: new THREE.Color(this.colorA) },
        uColorB: { value: new THREE.Color(this.colorB) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.navPoints = new THREE.Points(this.navGeometry, this.navMaterial)
    this.navPoints.frustumCulled = false
    this.navCount = count
    this.scene.add(this.navPoints)
  }

  /** 设置主星 hover 高亮（i 为 null 清除），aHover 属性驱动 shader 放大/增亮 */
  setNavStarHover(i: number | null): void {
    if (this.hoveredIndex === i) return
    if (this.hoveredIndex !== null && this.navGeometry) {
      const arr = this.navGeometry.getAttribute('aHover') as THREE.BufferAttribute
      arr.setX(this.hoveredIndex, 0)
      arr.needsUpdate = true
    }
    this.hoveredIndex = i
    if (i !== null && this.navGeometry) {
      const arr = this.navGeometry.getAttribute('aHover') as THREE.BufferAttribute
      arr.setX(i, 1)
      arr.needsUpdate = true
    }
  }

  /** client 坐标（px）→ 命中的主星索引或 null */
  pickNavStar(clientX: number, clientY: number): number | null {
    if (!this.navPoints || !this.camera || !this.renderer || !this.navPoints.visible) return null
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    // 主星在 shader 中漂移（最大 ~1.4 units），阈值需覆盖漂移幅度 + 星体半径，保证 hover 稳定
    this.raycaster.params.Points.threshold = 2.0
    this.raycaster.setFromCamera(ndc, this.camera)
    const hits = this.raycaster.intersectObject(this.navPoints, false)
    return hits.length > 0 ? (hits[0].index ?? null) : null
  }

  /** 主星屏幕坐标（px，供 HTML label 定位）；复刻 shader 漂移 + 场景视差旋转 */
  navStarScreenPositions(): { x: number; y: number }[] {
    if (!this.navGeometry || !this.camera || !this.renderer || !this.scene) return []
    const positions = this.navGeometry.getAttribute('position') as THREE.BufferAttribute
    const radii = this.navGeometry.getAttribute('aRadius') as THREE.BufferAttribute
    const speeds = this.navGeometry.getAttribute('aSpeed') as THREE.BufferAttribute
    const drifts = this.navGeometry.getAttribute('aDrift') as THREE.BufferAttribute
    const rect = this.renderer.domElement.getBoundingClientRect()
    const v = new THREE.Vector3()
    const out: { x: number; y: number }[] = []
    for (let i = 0; i < positions.count; i++) {
      // 与 particles.vert 的漂移公式保持一致（uTime === this.elapsed）
      const t = this.elapsed * speeds.getX(i) + drifts.getX(i)
      v.set(
        positions.getX(i) + Math.sin(t) * radii.getX(i),
        positions.getY(i) + Math.cos(t * 0.8) * radii.getX(i) * 0.6,
        positions.getZ(i) + Math.cos(t * 0.5) * radii.getX(i),
      )
      v.applyEuler(this.scene.rotation) // 视差作用在 scene 上，需同步旋转
      v.project(this.camera)
      out.push({ x: (v.x * 0.5 + 0.5) * rect.width, y: (-v.y * 0.5 + 0.5) * rect.height })
    }
    return out
  }

  private onResize(): void {
    if (!this.renderer || !this.camera) return
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    if (this.material) {
      this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }
    if (this.navMaterial) {
      this.navMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }
  }

  private onVisibility(): void {
    this.pageVisible = document.visibilityState === 'visible'
  }

  private tick = (): void => {
    if (this.disposed) return
    this.rafId = requestAnimationFrame(this.tick)
    if (!this.pageVisible || !this.renderer || !this.scene || !this.camera) {
      return
    }
    // 注意：getDelta 每帧只能调一次，勿与 getElapsedTime 混用（后者内部也调 getDelta）
    const dt = Math.min(this.clock.getDelta(), 0.05)
    if (this.reducedMotion) {
      if (this.renderedStatic) return // 只渲染一帧静态画面（§5.3）
      this.renderedStatic = true
    } else {
      this.elapsed += dt
      if (this.material) {
        this.material.uniforms.uTime.value = this.elapsed
      }
      // 主星与主粒子共享 uTime 语义（漂移动画），需每帧同步
      if (this.navMaterial) {
        this.navMaterial.uniforms.uTime.value = this.elapsed
      }
      // 视差：指数趋近（帧率无关），作用在场景整体
      const k = 2.5
      this.scene.rotation.y += (this.parallaxTarget.x * 0.4 - this.scene.rotation.y) * k * dt
      this.scene.rotation.x += (-this.parallaxTarget.y * 0.2 - this.scene.rotation.x) * k * dt
    }
    if (this.points && !this.points.visible) {
      return
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.initialized = false
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.onResizeBound)
    document.removeEventListener('visibilitychange', this.onVisibilityBound)
    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Points) {
        obj.geometry?.dispose()
        const mat = obj.material as THREE.ShaderMaterial | THREE.ShaderMaterial[]
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      }
    })
    this.renderer?.dispose()
    this.renderer = null
    this.scene = null
    this.camera = null
    this.points = null
    this.material = null
    this.geometry = null
    this.navPoints = null
    this.navGeometry = null
    this.navMaterial = null
    this.navCount = 0
    this.hoveredIndex = null
  }
}
