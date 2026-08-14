<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { listPosts, blogModules } from '@/lib/blog'
import ProjectCard from '@/components/ui/ProjectCard.vue'
import BlogCard from '@/components/ui/BlogCard.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

const heroRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3)
const latestPosts = listPosts(blogModules).slice(0, 3)

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
  </section>

  <div ref="scopeRef">
    <section class="section-container py-16">
      <SectionTitle title="精选项目" />
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard v-for="p in featuredProjects" :key="p.slug" :project="p" />
      </div>
    </section>

    <section class="section-container py-16">
      <SectionTitle title="最新文章" />
      <div class="grid gap-6 md:grid-cols-2">
        <BlogCard v-for="post in latestPosts" :key="post.slug" :post="post" />
      </div>
    </section>
  </div>
</template>
