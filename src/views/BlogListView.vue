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
    <SectionTitle title="博客" subtitle="记录学习与思考" />
    <div class="grid gap-6 md:grid-cols-2">
      <BlogCard v-for="post in posts" :key="post.slug" :post="post" />
    </div>
  </section>
</template>
