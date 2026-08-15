<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listPosts, blogModules } from '@/lib/blog'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { useInertiaTilt } from '@/composables/useInertiaTilt'

const posts = listPosts(blogModules)
const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

// 目录行磁吸惯性：每行一个实例；行是 RouterLink 渲染的 <a>，经组件实例 $el 取 DOM
const rowTilts = posts.map(() => {
  const el = ref<HTMLElement | null>(null)
  const { attach } = useInertiaTilt(el, 3)
  return { el, attach }
})
onMounted(() => rowTilts.forEach((t) => t.attach()))

function setRowRef(index: number, node: unknown) {
  const inst = node as { $el?: unknown } | null
  const el = inst && inst.$el instanceof HTMLElement ? inst.$el : null
  rowTilts[index].el.value = el
}
</script>

<template>
  <section ref="scopeRef" class="section-container min-h-screen">
    <SectionTitle over="Blog" title="博客" as="h1" subtitle="记录学习与思考" />
    <div v-if="posts.length === 0" class="border border-dashed border-white/10 rounded-xl py-20 text-center">
      <p class="text-4xl">🛰️</p>
      <p class="mt-4 text-text">信号还在深空漂移……第一条日志即将抵达。</p>
    </div>
    <div v-else class="flex flex-col">
      <RouterLink
        v-for="(post, i) in posts"
        :key="post.slug"
        :ref="(node) => setRowRef(i, node)"
        :to="`/blog/${post.slug}`"
        data-reveal
        class="group -mx-3 flex items-baseline gap-6 rounded-lg border-b border-white/10 px-3 py-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.03]"
      >
        <span class="w-28 shrink-0 font-mono text-xs text-text-muted transition-colors group-hover:text-primary/80">{{ post.date }}</span>
        <span class="flex-1 text-base font-semibold text-text transition-all group-hover:translate-x-1 group-hover:text-primary md:text-lg">{{ post.title }}</span>
        <span class="shrink-0 text-text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary">↗</span>
      </RouterLink>
    </div>
  </section>
</template>
