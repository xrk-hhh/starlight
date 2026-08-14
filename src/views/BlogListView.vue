<script setup lang="ts">
import { ref } from 'vue'
import { listPosts, blogModules } from '@/lib/blog'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

const posts = listPosts(blogModules)
const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)
</script>

<template>
  <section ref="scopeRef" class="section-container min-h-screen">
    <SectionTitle over="Blog" title="博客" subtitle="记录学习与思考" />
    <div v-if="posts.length === 0" class="border border-dashed border-white/10 rounded-xl py-20 text-center">
      <p class="text-4xl">🛰️</p>
      <p class="mt-4 text-text">信号还在深空漂移……第一条日志即将抵达。</p>
    </div>
    <div v-else class="flex flex-col">
      <RouterLink
        v-for="post in posts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        data-reveal
        class="group flex items-baseline gap-6 border-b border-white/10 py-4 transition-colors hover:border-white/20"
      >
        <span class="w-28 shrink-0 font-mono text-xs text-text-muted">{{ post.date }}</span>
        <span class="flex-1 text-base font-semibold text-text transition-all group-hover:translate-x-1 group-hover:text-primary md:text-lg">{{ post.title }}</span>
        <span class="shrink-0 text-text-muted transition-transform group-hover:translate-x-1">↗</span>
      </RouterLink>
    </div>
  </section>
</template>
