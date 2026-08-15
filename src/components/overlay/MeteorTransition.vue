<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import router from '@/router'

const overlayRef = ref<HTMLDivElement | null>(null)
const glowRef = ref<HTMLDivElement | null>(null)
const pathRef = ref<SVGPathElement | null>(null)

// 默认星蓝→星紫渐变；每次播放从三色轨道中随机取头/尾色
const TRACKS = ['#22d3ee', '#8b5cf6', '#fbbf24']
const headColor = ref('#22d3ee')
const tailColor = ref('#8b5cf6')

let ctx: gsap.Context | null = null
let tl: gsap.core.Timeline | null = null

function play() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const path = pathRef.value
  const glow = glowRef.value
  if (!path || !glow) return

  headColor.value = TRACKS[Math.floor(Math.random() * TRACKS.length)]
  tailColor.value = TRACKS[Math.floor(Math.random() * TRACKS.length)]

  const len = path.getTotalLength()
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })
  gsap.set(glow, { opacity: 0 })

  // 入场 0.35s：轨迹快速划入 + 满屏微亮；随后 0.45s 划出。与页面交叉淡入叠加，不替换
  tl?.kill()
  tl = gsap.timeline()
  tl.to(path, { strokeDashoffset: 0, opacity: 1, duration: 0.35, ease: 'power2.in' })
    .to(path, { strokeDashoffset: -len, opacity: 0, duration: 0.45, ease: 'power2.out' }, '+=0.05')
    .to(glow, { opacity: 0.08, duration: 0.35, ease: 'power2.out' }, 0)
    .to(glow, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0.4)
}

onMounted(() => {
  ctx = gsap.context(() => {
    const path = pathRef.value
    const glow = glowRef.value
    if (!path || !glow) return
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })
    gsap.set(glow, { opacity: 0 })
  }, overlayRef.value ?? undefined)
  // App 级单例组件，声明周期=应用期：afterEach 不注销
  router.afterEach(() => play())
})

onUnmounted(() => {
  tl?.kill()
  ctx?.revert()
})
</script>

<template>
  <div ref="overlayRef" class="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
    <!-- 满屏微亮层：radial 渐变，opacity 0→0.08→0 -->
    <div ref="glowRef" class="meteor-glow absolute inset-0"></div>
    <!-- 流星轨迹：左上→右下弧线 -->
    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="meteor-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" :stop-color="headColor" />
          <stop offset="100%" :stop-color="tailColor" />
        </linearGradient>
      </defs>
      <path
        ref="pathRef"
        class="meteor-path"
        d="M0 0 C 38 20, 62 80, 100 100"
        fill="none"
        stroke="url(#meteor-grad)"
        stroke-width="1.5"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>
</template>

<style scoped>
.meteor-glow {
  background:
    radial-gradient(ellipse at 30% 20%, rgba(34, 211, 238, 0.35), transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.35), transparent 60%);
}
</style>
