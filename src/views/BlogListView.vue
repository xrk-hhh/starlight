<script setup lang="ts">
import { ref } from 'vue'
import { listPosts, blogModules } from '@/lib/blog'
import BlogCard from '@/components/ui/BlogCard.vue'
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
    <div v-else class="grid gap-6 md:grid-cols-2">
      <BlogCard v-for="post in posts" :key="post.slug" :post="post" />
    </div>
  </section>
</template>
