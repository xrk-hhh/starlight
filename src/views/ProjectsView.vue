<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '@/data/projects'
import ProjectCard from '@/components/ui/ProjectCard.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

gsap.registerPlugin(ScrollTrigger)

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

// v1.4 星系横移：桌面（≥1024px）pin 住区段，项目卡横向穿过星场；
// reduced-motion 跳过 pin（隐藏横移容器，回退纵向 grid），媒体查询变化时重建。
// MQL 实例存为组件作用域变量：add/remove 必须用同一引用（同 ParticleBackground 的 mediaMobile 模式）
let mediaReduced: MediaQueryList | null = null
let mediaDesktop: MediaQueryList | null = null
const pinRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const isReduced = ref(false)
const isDesktop = ref(false)

let ctx: gsap.Context | null = null

// 横移进度（v1.6）：ScrollTrigger onUpdate 驱动，显示当前卡片序号
const progress = ref(0)
const currentIdx = computed(() => Math.round(progress.value * (projects.length - 1)))

function buildPin() {
  ctx?.revert()
  ctx = null
  if (isReduced.value || !isDesktop.value) return
  const pinEl = pinRef.value
  const trackEl = trackRef.value
  if (!pinEl || !trackEl) return
  ctx = gsap.context(() => {
    // 横移距离 = 轨道右缘超出视口部分 + 128px 余量（v1.5 修复：以轨道实际左缘为准，
    // 原先 scrollWidth - innerWidth 少算了轨道在 section 内的起始偏移，末卡被遮挡无法右移）
    const dist = () => {
      const rect = trackEl.getBoundingClientRect()
      const trackLeft = rect.left + window.scrollX
      return Math.max(0, trackLeft + trackEl.scrollWidth - window.innerWidth + 128)
    }
    gsap.to(trackEl, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: () => `+=${dist()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.value = self.progress
        },
      },
    })
  }, pinEl)
}

const onMediaChange = () => {
  isReduced.value = mediaReduced?.matches ?? false
  isDesktop.value = mediaDesktop?.matches ?? false
  buildPin()
}

onMounted(() => {
  mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaDesktop = window.matchMedia('(min-width: 1024px)')
  isReduced.value = mediaReduced.matches
  isDesktop.value = mediaDesktop.matches
  mediaReduced.addEventListener('change', onMediaChange)
  mediaDesktop.addEventListener('change', onMediaChange)
  buildPin()
})

onUnmounted(() => {
  mediaReduced?.removeEventListener('change', onMediaChange)
  mediaDesktop?.removeEventListener('change', onMediaChange)
  mediaReduced = null
  mediaDesktop = null
  ctx?.revert() // 覆盖 ScrollTrigger 清理（pin 样式/补位 spacer）
  ctx = null
})
</script>

<template>
  <section ref="scopeRef" class="section-container relative min-h-[60vh] overflow-hidden">
    <div class="relative z-10">
      <SectionTitle over="Projects" title="项目" as="h1" subtitle="我做过的部分项目" />
    </div>
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-16 z-0 overflow-hidden">
      <div class="marquee-track flex whitespace-nowrap">
        <span class="marquee-item font-mono text-8xl font-bold leading-none text-transparent" style="-webkit-text-stroke: 1px rgba(139,92,246,0.18)">PROJECTS // 作品&nbsp;&nbsp;</span>
        <span class="marquee-item font-mono text-8xl font-bold leading-none text-transparent" style="-webkit-text-stroke: 1px rgba(139,92,246,0.18)">PROJECTS // 作品&nbsp;&nbsp;</span>
      </div>
    </div>

    <!-- 桌面（≥1024px）：GSAP pin 星系横移；reduced-motion 时隐藏并回退纵向 grid -->
    <div ref="pinRef" class="relative z-10 hidden" :class="{ 'lg:block': !isReduced }">
      <div ref="trackRef" class="flex gap-8 will-change-transform">
        <div
          v-for="p in projects"
          :key="p.slug"
          class="w-[420px] shrink-0 opacity-95 transition-all duration-300 hover:opacity-100"
        >
          <ProjectCard :project="p" />
        </div>
      </div>
      <div class="mt-8 flex items-center justify-between font-mono text-xs text-text-muted/70">
        <span class="tracking-[0.3em]">← 滚动探索 →</span>
        <span class="tabular-nums">
          <span class="text-primary">{{ String(currentIdx + 1).padStart(2, '0') }}</span>
          <span class="mx-1 text-white/20">/</span>
          {{ String(projects.length).padStart(2, '0') }}
        </span>
      </div>
    </div>

    <!-- 移动端（<1024px）/ reduced-motion：纵向 grid -->
    <div
      class="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      :class="{ 'lg:hidden': !isReduced }"
    >
      <ProjectCard v-for="p in projects" :key="p.slug" :project="p" />
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  animation: marquee 40s linear infinite;
  width: max-content;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
