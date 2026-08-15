<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const scrollProgress = ref(0)
function onScroll() {
  scrolled.value = window.scrollY > 50
  const max = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const links = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于' },
  { to: '/projects', label: '项目' },
  { to: '/blog', label: '博客' },
]
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="scrolled ? 'border-b border-white/10 bg-bg/80 backdrop-blur' : ''"
  >
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <RouterLink to="/" class="glow-text font-mono text-lg font-bold">LOGO</RouterLink>
      <ul class="flex items-center gap-6 text-sm text-text-muted">
        <li v-for="link in links" :key="link.to">
          <RouterLink
            :to="link.to"
            class="transition-colors hover:text-text"
            active-class="text-text"
            exact-active-class="text-text"
            >{{ link.label }}</RouterLink
          >
        </li>
      </ul>
    </nav>
    <div v-if="scrolled" class="absolute inset-x-0 bottom-0 h-[3px] bg-white/5">
      <div
        class="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-[width] duration-100 ease-out"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>
  </header>
</template>
