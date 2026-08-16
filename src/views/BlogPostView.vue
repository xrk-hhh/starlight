<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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

// 上一篇/下一篇（v2.3）：列表按日期倒序，prev 更新、next 更早
const ordered = computed(() => listPosts(blogModules))
const postIdx = computed(() => ordered.value.findIndex((p) => p.slug === route.params.slug))
const prevPost = computed(() => (postIdx.value > 0 ? ordered.value[postIdx.value - 1] : null))
const nextPost = computed(() =>
  postIdx.value >= 0 && postIdx.value < ordered.value.length - 1
    ? ordered.value[postIdx.value + 1]
    : null,
)

// 悬浮目录（v2.1）：从渲染后的正文提取 h2 锚点，滚动时高亮当前小节。
// 目录条固定在 xl 以上宽屏右侧空白区，窄屏不渲染。
const contentEl = ref<HTMLElement | null>(null)
const headings = ref<{ id: string; text: string }[]>([])
const activeId = ref('')

function collectHeadings() {
  headings.value = [...(contentEl.value?.querySelectorAll<HTMLElement>('h2[id]') ?? [])].map(
    (h) => ({ id: h.id, text: h.textContent ?? '' }),
  )
}

// 代码块增强（v2.3）：悬浮复制按钮 + 语言角标。v-html 重渲染后需重挂。
function enhanceCodeBlocks() {
  for (const pre of contentEl.value?.querySelectorAll('pre') ?? []) {
    if (pre.querySelector('.copy-btn')) continue
    const lang = /language-([\w-]+)/.exec(pre.querySelector('code')?.className ?? '')?.[1]
    if (lang && lang !== 'text') {
      const chip = document.createElement('span')
      chip.className = 'code-lang'
      chip.textContent = lang
      pre.appendChild(chip)
    }
    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.type = 'button'
    btn.textContent = '复制'
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? '')
        btn.textContent = '已复制 ✓'
      } catch {
        btn.textContent = '复制失败'
      }
      setTimeout(() => (btn.textContent = '复制'), 1600)
    })
    pre.appendChild(btn)
  }
}
function syncActiveHeading() {
  const hs = contentEl.value?.querySelectorAll<HTMLElement>('h2[id]')
  if (!hs || !hs.length) return
  let current = hs[0].id
  for (const h of hs) {
    if (h.getBoundingClientRect().top < 140) current = h.id
  }
  activeId.value = current
}
function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0
  syncActiveHeading()
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
watch(
  () => route.params.slug,
  async () => {
    await nextTick()
    collectHeadings()
    enhanceCodeBlocks()
    onScroll()
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="fixed left-0 top-0 z-[60] h-0.5 bg-primary transition-[width] duration-150"
    :style="{ width: progress + '%' }"
    aria-hidden="true"
  ></div>
  <article class="section-container min-h-[60vh] max-w-3xl">
    <div v-if="post">
      <!-- 返回博客列表（v1.8）：置顶悬浮在左上角，随时可撤离 -->
      <RouterLink
        to="/blog"
        class="group -ml-2 mb-8 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface/60 px-3 py-1.5 text-sm text-text-muted backdrop-blur transition-all hover:border-primary/50 hover:text-primary"
      >
        <span aria-hidden="true" class="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
        返回博客
      </RouterLink>
      <!-- 悬浮目录（xl+ 宽屏）：scroll-spy 高亮当前小节 -->
      <nav
        v-if="headings.length > 1"
        aria-label="文章目录"
        class="fixed right-6 top-32 z-30 hidden w-44 xl:block"
      >
        <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted/40">On this page</p>
        <ul class="space-y-0.5 border-l border-white/5">
          <li v-for="h in headings" :key="h.id">
            <a
              :href="`#${h.id}`"
              class="block truncate border-l-2 py-1 pl-3 text-xs transition-all duration-200"
              :class="
                activeId === h.id
                  ? '-ml-px border-primary text-primary'
                  : 'border-transparent text-text-muted/50 hover:text-text'
              "
            >
              {{ h.text }}
            </a>
          </li>
        </ul>
      </nav>
      <h1 class="text-3xl font-bold md:text-4xl">{{ post.title }}</h1>
      <div class="mt-3 flex items-center gap-4 font-mono text-sm text-text-muted">
        <time>{{ post.date }}</time>
        <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
        <span class="text-text-muted">约 {{ wordCount }} 字 · 阅读 {{ minutes }} 分钟</span>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -- 内容经 markdown-it（html:false）+ shiki 渲染，无原始 HTML 通过，XSS 面有测试覆盖 -->
      <div ref="contentEl" class="blog-content mt-10" v-html="html"></div>

      <!-- 上一篇 / 下一篇（v2.3） -->
      <nav v-if="prevPost || nextPost" aria-label="相邻文章" class="mt-14 grid gap-4 sm:grid-cols-2">
        <RouterLink
          v-if="prevPost"
          :to="`/blog/${prevPost.slug}`"
          class="group rounded-xl border border-white/10 bg-surface/60 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
        >
          <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted/50">← 上一篇</p>
          <p class="mt-1.5 truncate text-sm text-text transition-colors group-hover:text-primary">
            {{ prevPost.title }}
          </p>
        </RouterLink>
        <span v-else aria-hidden="true"></span>
        <RouterLink
          v-if="nextPost"
          :to="`/blog/${nextPost.slug}`"
          class="group rounded-xl border border-white/10 bg-surface/60 p-4 text-right backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
        >
          <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted/50">下一篇 →</p>
          <p class="mt-1.5 truncate text-sm text-text transition-colors group-hover:text-primary">
            {{ nextPost.title }}
          </p>
        </RouterLink>
      </nav>
      <GiscusComments />
    </div>
    <p v-else class="text-text-muted">文章不存在</p>
  </article>
</template>
