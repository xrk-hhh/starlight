import * as THREE from 'three'
import vertexShader from './shaders/particles.vert?raw'
import fragmentShader from './shaders/particles.frag?raw'
import { resolveParticleCount, type ParticleDensity } from '@/stores/particles'

export interface ParticleSceneOptions {
  count: number
  colorA: string
  colorB: string
}

export class ParticleScene {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private points: THREE.Points | null = null
  private material: THREE.ShaderMaterial | null = null
  private geometry: THREE.BufferGeometry | null = null
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

    this.buildPoints(options.count, options.colorA, options.colorB)
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
  }
}
