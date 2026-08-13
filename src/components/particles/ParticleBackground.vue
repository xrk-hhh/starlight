<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { ParticleScene } from '@/three/ParticleScene'
import { particlesState } from '@/stores/particles'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: ParticleScene | null = null
let mediaMobile: MediaQueryList | null = null
let mediaReduced: MediaQueryList | null = null

// 监听回调必须与移除时引用一致，故定义为组件作用域具名函数
const applyMobile = () => scene?.setMobile(mediaMobile?.matches ?? false)
const applyReduced = () => scene?.setReducedMotion(mediaReduced?.matches ?? false)

function onPointerMove(e: PointerEvent) {
  scene?.setParallaxTarget(
    e.clientX / window.innerWidth - 0.5,
    e.clientY / window.innerHeight - 0.5,
  )
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  try {
    scene = new ParticleScene(canvas)
    scene.init({ count: 1000, colorA: '#22d3ee', colorB: '#8b5cf6' })
  } catch (err) {
    // WebGL 不可用（§5.3）：隐藏 canvas，回退 main.css 里的 CSS 渐变背景
    console.warn('[particles] WebGL 初始化失败，回退静态背景', err)
    canvas.style.display = 'none'
    return
  }
  scene.setDensity(particlesState.density) // 补上初始密度（watch 无 immediate）
  mediaMobile = window.matchMedia('(max-width: 767px)')
  mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaMobile.addEventListener('change', applyMobile)
  mediaReduced.addEventListener('change', applyReduced)
  applyMobile()
  applyReduced()
  window.addEventListener('pointermove', onPointerMove, { passive: true })
})

watch(
  () => particlesState.density,
  (d) => scene?.setDensity(d),
)

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
  mediaMobile?.removeEventListener('change', applyMobile)
  mediaReduced?.removeEventListener('change', applyReduced)
  scene?.dispose()
  scene = null
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-0 h-full w-full"
    aria-hidden="true"
  ></canvas>
</template>
