<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { listPosts, blogModules } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'

const route = useRoute()
const post = computed(() =>
  listPosts(blogModules).find((p) => p.slug === route.params.slug),
)
const html = computed(() => (post.value ? renderMarkdown(post.value.content) : ''))
</script>

<template>
  <article class="section-container min-h-screen max-w-3xl">
    <div v-if="post">
      <h1 class="text-3xl font-bold md:text-4xl">{{ post.title }}</h1>
      <div class="mt-3 flex items-center gap-4 font-mono text-sm text-text-muted">
        <time>{{ post.date }}</time>
        <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -- 内容经 markdown-it（html:false）+ shiki 渲染，无原始 HTML 通过，XSS 面有测试覆盖 -->
      <div class="blog-content mt-10" v-html="html"></div>
    </div>
    <p v-else class="text-text-muted">文章不存在</p>
  </article>
</template>
