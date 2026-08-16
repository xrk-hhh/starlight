<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { profile } from '@/data/profile'

const router = useRouter()
const open = ref(false)
const pendingG = ref(false)
const feedback = ref('')
let feedbackTimer: ReturnType<typeof setTimeout> | null = null

const shortcuts: { keys: string[]; desc: string; feedback?: boolean }[] = [
  { keys: ['g', 'h'], desc: '首页' },
  { keys: ['g', 'a'], desc: '关于' },
  { keys: ['g', 'p'], desc: '项目' },
  { keys: ['g', 'b'], desc: '博客' },
  { keys: ['g', 'n'], desc: '日志' },
  { keys: ['g', 'f'], desc: '友邻' },
  { keys: ['g', 'm'], desc: '留言板' },
  { keys: ['r'], desc: '随机漫游一篇' },
  { keys: ['c'], desc: '复制邮箱', feedback: true },
  { keys: ['esc'], desc: '关闭' },
]

function isTypingTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

function showFeedback(msg: string) {
  feedback.value = msg
  if (feedbackTimer !== null) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    feedback.value = ''
    feedbackTimer = null
  }, 1500)
}

async function wanderRandom() {
  const { listPosts, blogModules } = await import('@/lib/blog')
  const posts = listPosts(blogModules)
  if (!posts.length) return
  void router.push(`/blog/${posts[Math.floor(Math.random() * posts.length)].slug}`)
  close()
}

async function copyEmail() {
  const social = profile.socials.find((s) => s.label === '邮箱')
  const email = (social?.url ?? '').replace(/^mailto:/, '')
  try {
    await navigator.clipboard.writeText(email)
    showFeedback('已复制邮箱 ✓')
  } catch {
    showFeedback('复制失败')
  }
}

function close() {
  open.value = false
  pendingG.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === '?') {
    if (isTypingTarget(e)) return
    e.preventDefault()
    open.value = !open.value
    if (!open.value) pendingG.value = false
    return
  }
  if (!open.value) return
  if (e.key === 'Escape') {
    close()
    return
  }
  if (pendingG.value) {
    const targets: Record<string, string> = { h: '/', a: '/about', p: '/projects', b: '/blog', n: '/now', f: '/friends', m: '/guestbook' }
    const path = targets[e.key]
    if (path) {
      void router.push(path)
      close()
    } else {
      pendingG.value = false
    }
    return
  }
  if (e.key === 'g') {
    pendingG.value = true
    return
  }
  if (e.key === 'c') {
    void copyEmail()
  }
  if (e.key === 'r') {
    void wanderRandom()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (feedbackTimer !== null) clearTimeout(feedbackTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4"
        role="dialog"
        aria-label="快捷键"
      >
        <div class="absolute inset-0 bg-black/60" @click="close"></div>
        <div class="card relative w-full max-w-md p-6">
          <h2 class="text-lg font-semibold">快捷键</h2>
          <ul class="mt-4 space-y-2.5">
            <li
              v-for="item in shortcuts"
              :key="item.keys.join('')"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-1.5">
                <kbd
                  v-for="k in item.keys"
                  :key="k"
                  class="rounded border border-white/20 bg-surface px-2 py-0.5 font-mono text-xs"
                >
                  {{ k }}
                </kbd>
              </span>
              <span class="flex items-center gap-2 text-text-muted">
                {{ item.desc }}
                <span v-if="item.feedback && feedback" class="text-xs text-primary">{{ feedback }}</span>
              </span>
            </li>
          </ul>
          <p v-if="pendingG" class="mt-4 text-xs text-primary">按下 g 后请按目标键…</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
