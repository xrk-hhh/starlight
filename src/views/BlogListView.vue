<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listPosts, blogModules, type BlogMeta } from '@/lib/blog'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { useInertiaTilt } from '@/composables/useInertiaTilt'

const posts = listPosts(blogModules)
const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

// v1.6：标签筛选 + 标题/摘要搜索（纯前端，无依赖）
const activeTag = ref<string | null>(null)
const query = ref('')
const tags = computed(() => [...new Set(posts.flatMap((p) => p.tags))].sort())
const filteredPosts = computed(() =>
  posts.filter((p) => {
    if (activeTag.value && !p.tags.includes(activeTag.value)) return false
    const q = query.value.trim().toLowerCase()
    if (!q) return true
    return (
      p.title.toLowerCase().includes(q) ||
      (p.desc ?? '').toLowerCase().includes(q)
    )
  }),
)

// 目录行磁吸惯性：每行一个实例（按 slug 映射，过滤后行号变化也不串位）
const tiltMap = new Map<string, { el: ReturnType<typeof ref<HTMLElement | null>>; attach: () => void }>()
posts.forEach((p) => {
  const el = ref<HTMLElement | null>(null)
  const { attach } = useInertiaTilt(el, 3)
  tiltMap.set(p.slug, { el, attach })
})
onMounted(() => tiltMap.forEach((t) => t.attach()))

function setRowRef(post: BlogMeta, node: unknown) {
  const inst = node as { $el?: unknown } | null
  const el = inst && inst.$el instanceof HTMLElement ? inst.$el : null
  const slot = tiltMap.get(post.slug)
  if (slot) slot.el.value = el
}
</script>

<template>
  <section ref="scopeRef" class="section-container min-h-[60vh]">
    <SectionTitle over="Blog" title="博客" as="h1" subtitle="记录学习与思考" />
    <div v-if="posts.length === 0" class="border border-dashed border-white/10 rounded-xl py-20 text-center">
      <p class="text-4xl">🛰️</p>
      <p class="mt-4 text-text">信号还在深空漂移……第一条日志即将抵达。</p>
    </div>
    <div v-else class="flex flex-col">
      <!-- 搜索 + 标签筛选（v1.6） -->
      <div data-reveal class="mb-8 space-y-4">
        <div class="relative">
          <input
            v-model="query"
            type="search"
            placeholder="搜索标题或摘要…"
            aria-label="搜索文章"
            class="w-full rounded-lg border border-white/10 bg-surface/60 px-4 py-2.5 pl-10 text-sm text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:outline-none"
          />
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-text-muted/50" aria-hidden="true">⌕</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border px-3.5 py-1 font-mono text-xs transition-all duration-200"
            :class="
              activeTag === null
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-white/10 text-text-muted hover:border-white/30 hover:text-text'
            "
            @click="activeTag = null"
          >
            全部
          </button>
          <button
            v-for="tag in tags"
            :key="tag"
            type="button"
            class="rounded-full border px-3.5 py-1 font-mono text-xs transition-all duration-200"
            :class="
              activeTag === tag
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-white/10 text-text-muted hover:border-white/30 hover:text-text'
            "
            @click="activeTag = activeTag === tag ? null : tag"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <p v-if="filteredPosts.length === 0" class="py-16 text-center font-mono text-sm text-text-muted">
        🛰️ 没有匹配的信号，换个关键词试试。
      </p>
      <template v-else>
        <RouterLink
          v-for="post in filteredPosts"
          :key="post.slug"
          :ref="(node) => setRowRef(post, node)"
          :to="`/blog/${post.slug}`"
          data-reveal
          class="group -mx-3 flex items-baseline gap-6 rounded-lg border-b border-white/10 px-3 py-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.03]"
        >
          <span class="w-28 shrink-0 font-mono text-xs text-text-muted transition-colors group-hover:text-primary/80">{{ post.date }}</span>
          <span class="flex-1 text-base font-semibold text-text transition-all group-hover:translate-x-1 group-hover:text-primary md:text-lg">{{ post.title }}</span>
          <span class="hidden shrink-0 font-mono text-[10px] text-text-muted/60 sm:inline">{{ post.tags.map((t) => `#${t}`).join(' ') }}</span>
          <span class="shrink-0 text-text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary">↗</span>
        </RouterLink>
      </template>
    </div>
  </section>
</template>
