<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { listPosts, blogModules } from '@/lib/blog'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import ElasticHeading from '@/components/ui/ElasticHeading.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { useTypewriter } from '@/composables/useTypewriter'

const heroRef = ref<HTMLElement | null>(null)
const hintRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null
let hintHidden = false
function onHintScroll() {
  const hide = window.scrollY > 80
  if (hide !== hintHidden) {
    hintHidden = hide
    hintRef.value?.classList.toggle('scroll-hint-hidden', hide)
  }
}

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3)
const latestPosts = listPosts(blogModules).slice(0, 3)

const { text: typed } = useTypewriter(profile.typedPhrases)

// 打字区用最长短语做不可见占位（绝对定位真实文本），打字过程不改变布局（防 CLS）
const typedPhrasesMax = [...profile.typedPhrases].sort((a, b) => b.length - a.length)[0]

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

onMounted(() => {
  window.addEventListener('scroll', onHintScroll, { passive: true })
  if (!heroRef.value) return
  // reduced-motion：跳过入场动画，hero 保持可见终态（ctx 为 null，onUnmounted 的 ctx?.revert() 安全）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  void (async () => {
    const gsap = (await import('gsap')).default
    if (!heroRef.value) return // await 期间组件卸载
    ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
      tl.from('.hero-title', { y: 50, opacity: 0 })
        .from('.hero-motto', { y: 20, opacity: 0 }, '-=0.7')
        .from('.hero-subtitle', { y: 30, opacity: 0 }, '-=0.7')
        .from('.hero-cta', { y: 20, opacity: 0 }, '-=0.7')
    }, heroRef.value)
  })()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onHintScroll)
  ctx?.revert()
})
</script>

<template>
  <div>
    <section ref="heroRef" class="section-container relative flex min-h-screen flex-col justify-center">
      <p class="hero-subtitle font-mono text-sm text-primary">
        {{ profile.title }}
      </p>
      <h1 class="hero-title mt-4 text-5xl font-bold leading-tight md:text-7xl">
        <svg viewBox="0 0 420 110" class="h-auto w-full max-w-xl" role="img" :aria-label="profile.name">
          <text x="4" y="78" class="svg-name" fill="url(#nameGrad)" stroke="url(#nameGrad)" stroke-width="1.5">
            {{ profile.name }}
          </text>
          <defs>
            <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#22d3ee" />
              <stop offset="1" stop-color="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </h1>
      <p class="hero-motto mt-3 font-mono text-sm text-primary/70">
        {{ profile.motto }}
      </p>
      <p class="hero-subtitle mt-6 max-w-xl text-base text-text-muted md:text-lg">
        {{ profile.introShort }}
        <span class="relative inline-block whitespace-nowrap align-baseline">
          <span class="invisible">{{ typedPhrasesMax }}</span>
          <span class="absolute left-0 top-0 whitespace-nowrap text-primary"
            >{{ typed }}<span class="hero-caret" aria-hidden="true">▍</span></span
          >
        </span>
      </p>
      <ElasticHeading
        class="hero-cta mt-8 text-xl text-text-muted md:text-2xl"
        text="代码 · 算法 · 星空 —— 记录每一次航行"
      />
      <p class="hero-cta mt-3 font-serif text-sm italic text-text-muted/70">coding among the stars ✦</p>
      <div class="hero-cta mt-10 flex gap-4">
        <RouterLink to="/projects" class="btn-primary">看看项目</RouterLink>
        <RouterLink
          to="/about"
          class="inline-flex items-center rounded-lg border border-white/10 px-6 py-3 text-sm transition-colors hover:border-white/30"
        >
          关于我
        </RouterLink>
      </div>
      <dl class="hero-cta mt-12 max-w-md">
        <div
          v-for="f in profile.quickFacts"
          :key="f.label"
          class="flex items-baseline justify-between gap-6 border-b border-white/10 py-1.5"
        >
          <dt class="font-mono text-xs tracking-[0.25em] text-text-muted/70">{{ f.label }}</dt>
          <dd class="text-sm text-text">{{ f.value }}</dd>
        </div>
      </dl>
      <!-- 滚动指示器：首屏底部缓动下落箭头，滚动后淡出（v1.5 设计增强） -->
      <div
        ref="hintRef"
        class="scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div class="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 pt-1.5">
          <span class="scroll-hint-dot h-1.5 w-1 rounded-full bg-primary/80"></span>
        </div>
      </div>
    </section>

    <div ref="scopeRef">
      <section class="section-container py-14">
        <SectionTitle over="Featured Work" title="精选项目" />
        <ul class="flex flex-col divide-y divide-white/5">
          <li v-for="p in featuredProjects" :key="p.slug" data-reveal>
            <a
              :href="p.github"
              target="_blank"
              rel="noopener"
              class="group -mx-3 flex items-baseline justify-between gap-6 rounded-lg px-3 py-4 transition-all duration-200 hover:bg-white/[0.03]"
            >
              <span>
                <span class="font-semibold text-text transition-colors group-hover:text-primary">{{ p.title }}</span>
                <span class="ml-3 text-sm text-text-muted">{{ p.description.slice(0, 42) }}{{ p.description.length > 42 ? '…' : '' }}</span>
              </span>
              <span class="shrink-0 font-mono text-xs text-text-muted transition-transform duration-200 group-hover:translate-x-1">GitHub →</span>
            </a>
          </li>
        </ul>
        <RouterLink to="/projects" data-reveal class="group mt-6 inline-flex items-center gap-1 text-sm text-primary">
          <span class="transition-colors group-hover:text-accent">查看全部项目</span>
          <span class="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </RouterLink>
      </section>

      <section class="section-container py-14">
        <SectionTitle over="From The Blog" title="最新文章" />
        <ul class="flex flex-col divide-y divide-white/5">
          <li v-for="post in latestPosts" :key="post.slug" data-reveal>
            <RouterLink
              :to="`/blog/${post.slug}`"
              class="group -mx-3 flex items-baseline justify-between gap-6 rounded-lg px-3 py-4 transition-all duration-200 hover:bg-white/[0.03]"
            >
              <span class="font-semibold text-text transition-colors group-hover:text-primary">{{ post.title }}</span>
              <span class="shrink-0 font-mono text-xs text-text-muted transition-transform duration-200 group-hover:-translate-x-1">{{ post.date }}</span>
            </RouterLink>
          </li>
        </ul>
        <RouterLink to="/blog" data-reveal class="group mt-6 inline-flex items-center gap-1 text-sm text-primary">
          <span class="transition-colors group-hover:text-accent">查看全部文章</span>
          <span class="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </RouterLink>
      </section>

      <section class="section-container py-16">
        <SectionTitle title="本站怎么逛" over="Start Here" />
        <div class="grid gap-6 md:grid-cols-3">
          <div data-reveal class="card flex flex-col p-6">
            <span class="font-mono text-xl text-primary">01</span>
            <h3 class="mt-3 text-base font-semibold">看项目</h3>
            <p class="mt-1 flex-1 text-sm leading-6 text-text-muted">从 Galaxy Defender 到 2048 Arena，都是能跑的东西。</p>
            <RouterLink to="/projects" class="mt-4 text-sm text-primary hover:underline">前往项目 →</RouterLink>
          </div>
          <div data-reveal class="card flex flex-col p-6">
            <span class="font-mono text-xl text-primary">02</span>
            <h3 class="mt-3 text-base font-semibold">读博客</h3>
            <p class="mt-1 flex-1 text-sm leading-6 text-text-muted">算法复盘、项目笔记与建站实录，都在这里。</p>
            <RouterLink to="/blog" class="mt-4 text-sm text-primary hover:underline">前往博客 →</RouterLink>
          </div>
          <div data-reveal class="card flex flex-col p-6">
            <span class="font-mono text-xl text-primary">03</span>
            <h3 class="mt-3 text-base font-semibold">找 GitHub</h3>
            <p class="mt-1 flex-1 text-sm leading-6 text-text-muted">所有项目源码与历史提交，公开可见。</p>
            <a :href="'https://github.com/' + profile.name" target="_blank" rel="noopener" class="mt-4 text-sm text-primary hover:underline">前往 GitHub →</a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero-caret {
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

/* 滚动指示器：点下落循环；滚动 80px 后整体淡出（js 控制 opacity class） */
.scroll-hint {
  transition: opacity 0.3s ease;
}
.scroll-hint.scroll-hint-hidden {
  opacity: 0;
}
.scroll-hint-dot {
  animation: hint-drop 1.6s ease-in-out infinite;
}
@keyframes hint-drop {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  70% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 0;
  }
}

.svg-name {
  font-size: 84px;
  fill: transparent;
  stroke-dasharray: 2500;
  stroke-dashoffset: 2500;
  animation:
    name-draw 2.4s ease-in-out 0.6s forwards,
    name-fill 0.5s ease-in-out 3s forwards;
}

@keyframes name-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes name-fill {
  to {
    fill: url(#nameGrad);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-caret {
    animation: none;
  }

  .scroll-hint-dot {
    animation: none;
  }

  .svg-name {
    fill: url(#nameGrad);
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    animation: none;
  }
}
</style>
