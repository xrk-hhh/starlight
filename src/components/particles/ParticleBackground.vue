<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ParticleScene } from '@/three/ParticleScene'
import { particlesState } from '@/stores/particles'
import { profile } from '@/data/profile'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: ParticleScene | null = null
let mediaMobile: MediaQueryList | null = null
let mediaReduced: MediaQueryList | null = null
let coarse = false // 触屏设备：主星渲染但不交互
let hoverIdx: number | null = null
let labelRaf = 0

const hoveredLabel = ref<string | null>(null)
const labelX = ref(0)
const labelY = ref(0)

// 主星导航路由：邮箱从 profile.socials 推导，避免硬编码
const navRoutes = computed(() => {
  const email = profile.socials.find((s) => s.label === '邮箱')?.url
  return [
    { label: '首页', to: '/' },
    { label: '关于', to: '/about' },
    { label: '项目', to: '/projects' },
    { label: '博客', to: '/blog' },
    { label: 'GitHub', to: 'https://github.com/xrk-hhh' },
    { label: '邮箱', to: email ?? 'mailto:xxjh2487657826@outlook.com' },
  ]
})

// 监听回调必须与移除时引用一致，故定义为组件作用域具名函数
const applyMobile = () => {
  scene?.setMobile(mediaMobile?.matches ?? false)
  if (mediaMobile?.matches) clearHover()
}
const applyReduced = () => {
  scene?.setReducedMotion(mediaReduced?.matches ?? false)
  if (mediaReduced?.matches) clearHover()
}

function clearHover() {
  hoverIdx = null
  scene?.setNavStarHover(null)
  hoveredLabel.value = null
  stopLabelTrack()
}

function startLabelTrack() {
  if (labelRaf) cancelAnimationFrame(labelRaf)
  labelRaf = requestAnimationFrame(trackLabel)
}

function stopLabelTrack() {
  if (labelRaf) cancelAnimationFrame(labelRaf)
  labelRaf = 0
}

// hover 期间让 label 跟随主星（主星有漂移 + 视差，需逐帧定位）
function trackLabel() {
  if (hoverIdx !== null && scene) {
    const pos = scene.navStarScreenPositions()[hoverIdx]
    if (pos) {
      labelX.value = pos.x
      labelY.value = pos.y
    }
    labelRaf = requestAnimationFrame(trackLabel)
  }
}

function onPointerMove(e: PointerEvent) {
  scene?.setParallaxTarget(
    e.clientX / window.innerWidth - 0.5,
    e.clientY / window.innerHeight - 0.5,
  )
  // 主星 hover：coarse（触屏）/ reduced-motion 下跳过
  if (!scene || coarse || (mediaReduced?.matches ?? false)) return
  const idx = scene.pickNavStar(e.clientX, e.clientY)
  if (idx === hoverIdx) return
  hoverIdx = idx
  scene.setNavStarHover(idx)
  hoveredLabel.value = idx === null ? null : (navRoutes.value[idx]?.label ?? null)
  if (idx !== null) {
    const pos = scene.navStarScreenPositions()[idx]
    if (pos) {
      labelX.value = pos.x
      labelY.value = pos.y
    }
    startLabelTrack()
  } else {
    stopLabelTrack()
  }
}

// canvas 保持 pointer-events-none，点击用 window 级监听；
// 点击时重校验命中（pickNavStar），只有真点在主星上才消费，避免与页面元素点击冲突
function onClick(e: MouseEvent) {
  if (!scene || coarse || (mediaReduced?.matches ?? false)) return
  const idx = scene.pickNavStar(e.clientX, e.clientY)
  if (idx === null) return
  const target = navRoutes.value[idx]?.to
  if (!target) return
  if (target.startsWith('http') || target.startsWith('mailto:')) {
    window.open(target, '_blank')
  } else {
    void router.push(target)
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  try {
    scene = new ParticleScene(canvas)
    scene.init({
      count: 1000,
      colorA: '#22d3ee',
      colorB: '#8b5cf6',
      navStars: navRoutes.value.length,
    })
  } catch (err) {
    // WebGL 不可用（§5.3）：隐藏 canvas，回退 main.css 里的 CSS 渐变背景
    console.warn('[particles] WebGL 初始化失败，回退静态背景', err)
    canvas.style.display = 'none'
    return
  }
  scene.setDensity(particlesState.density) // 补上初始密度（watch 无 immediate）
  mediaMobile = window.matchMedia('(max-width: 767px)')
  mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  coarse = window.matchMedia('(pointer: coarse)').matches
  mediaMobile.addEventListener('change', applyMobile)
  mediaReduced.addEventListener('change', applyReduced)
  applyMobile()
  applyReduced()
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('click', onClick)
})

watch(
  () => particlesState.density,
  (d) => {
    scene?.setDensity(d)
    // 密度 off（如博客文章页）主星隐藏：清掉悬停状态，避免 label 滞留
    if (d === 'off') clearHover()
  },
)

onUnmounted(() => {
  stopLabelTrack()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('click', onClick)
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
  <Transition name="fade">
    <span
      v-if="hoveredLabel"
      class="pointer-events-none fixed z-30 rounded-full border border-primary/40 bg-bg/90 px-3 py-1 font-mono text-xs text-text"
      :style="{ left: labelX + 'px', top: labelY - 34 + 'px' }"
    >
      {{ hoveredLabel }}
    </span>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
