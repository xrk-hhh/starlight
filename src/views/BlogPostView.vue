<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { listPosts, blogModules, countWords, readingTimeMinutes } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'
import GiscusComments from '@/components/blog/GiscusComments.vue'

const route = useRoute()
const post = computed(() =>
  listPosts(blogModules).find((p) => p.slug === route.params.slug),
)
const html = computed(() => (post.value ? renderMarkdown(post.value.content) : ''))

const wordCount = computed(() => (post.value ? countWords(post.value.content) : 0))
const minutes = computed(() => (post.value ? readingTimeMinutes(post.value.content) : 0))

const progress = ref(0)
const onScroll = () => {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    class="fixed left-0 top-0 z-[60] h-0.5 bg-primary transition-[width] duration-150"
    :style="{ width: progress + '%' }"
    aria-hidden="true"
  ></div>
  <article class="section-container min-h-screen max-w-3xl">
    <div v-if="post">
      <h1 class="text-3xl font-bold md:text-4xl">{{ post.title }}</h1>
      <div class="mt-3 flex items-center gap-4 font-mono text-sm text-text-muted">
        <time>{{ post.date }}</time>
        <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
        <span class="text-text-muted">约 {{ wordCount }} 字 · 阅读 {{ minutes }} 分钟</span>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -- 内容经 markdown-it（html:false）+ shiki 渲染，无原始 HTML 通过，XSS 面有测试覆盖 -->
      <div class="blog-content mt-10" v-html="html"></div>
      <GiscusComments />
    </div>
    <p v-else class="text-text-muted">文章不存在</p>
  </article>
</template>
