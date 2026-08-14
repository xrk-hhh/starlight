<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { listPosts, blogModules } from '@/lib/blog'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { useTypewriter } from '@/composables/useTypewriter'

const heroRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3)
const latestPosts = listPosts(blogModules).slice(0, 3)

const { text: typed } = useTypewriter(profile.typedPhrases)

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

onMounted(() => {
  if (!heroRef.value) return
  // reduced-motion：跳过入场动画，hero 保持可见终态（ctx 为 null，onUnmounted 的 ctx?.revert() 安全）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
    tl.from('.hero-title', { y: 50, opacity: 0 })
      .from('.hero-motto', { y: 20, opacity: 0 }, '-=0.7')
      .from('.hero-subtitle', { y: 30, opacity: 0 }, '-=0.7')
      .from('.hero-cta', { y: 20, opacity: 0 }, '-=0.7')
  }, heroRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="heroRef" class="section-container flex min-h-screen flex-col justify-center">
    <p class="hero-subtitle font-mono text-sm text-primary">
      {{ profile.title }}
    </p>
    <h1 class="hero-title mt-4 text-5xl font-bold leading-tight md:text-7xl">
      {{ profile.name }}
    </h1>
    <p class="hero-motto mt-3 font-mono text-sm text-primary/70">
      {{ profile.motto }}
    </p>
    <p class="hero-subtitle mt-6 max-w-xl text-lg text-text-muted">
      {{ profile.introShort }}
      <span class="text-primary">{{ typed }}<span class="hero-caret" aria-hidden="true">▍</span></span>
    </p>
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
  </section>

  <div ref="scopeRef">
    <section class="section-container py-16">
      <SectionTitle over="Featured Work" title="精选项目" />
      <ul class="flex flex-col divide-y divide-white/5">
        <li v-for="p in featuredProjects" :key="p.slug" data-reveal>
          <a
            :href="p.github"
            target="_blank"
            rel="noopener"
            class="group flex items-baseline justify-between gap-6 py-4 transition-colors"
          >
            <span>
              <span class="font-semibold text-text group-hover:text-primary">{{ p.title }}</span>
              <span class="ml-3 text-sm text-text-muted">{{ p.description.slice(0, 42) }}{{ p.description.length > 42 ? '…' : '' }}</span>
            </span>
            <span class="shrink-0 font-mono text-xs text-text-muted transition-transform group-hover:translate-x-0.5">GitHub →</span>
          </a>
        </li>
      </ul>
      <RouterLink to="/projects" data-reveal class="mt-6 inline-flex text-sm text-primary hover:underline">
        查看全部项目 →
      </RouterLink>
    </section>

    <section class="section-container py-16">
      <SectionTitle over="From The Blog" title="最新文章" />
      <ul class="flex flex-col divide-y divide-white/5">
        <li v-for="post in latestPosts" :key="post.slug" data-reveal>
          <RouterLink :to="`/blog/${post.slug}`" class="group flex items-baseline justify-between gap-6 py-4">
            <span class="font-semibold text-text group-hover:text-primary">{{ post.title }}</span>
            <span class="shrink-0 font-mono text-xs text-text-muted">{{ post.date }}</span>
          </RouterLink>
        </li>
      </ul>
      <RouterLink to="/blog" data-reveal class="mt-6 inline-flex text-sm text-primary hover:underline">
        查看全部文章 →
      </RouterLink>
    </section>
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

@media (prefers-reduced-motion: reduce) {
  .hero-caret {
    animation: none;
  }
}
</style>
