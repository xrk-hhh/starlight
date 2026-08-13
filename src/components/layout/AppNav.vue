<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
function onScroll() {
  scrolled.value = window.scrollY > 50
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
  </header>
</template>
