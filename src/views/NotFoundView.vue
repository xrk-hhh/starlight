<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const currentPath = computed(() => useRoute().fullPath.split('?')[0])
</script>

<template>
  <section class="section-container flex min-h-screen flex-col justify-center font-mono">
    <p class="text-text-muted">$ cd /{{ currentPath }}</p>
    <p class="mt-2 text-xl text-text">404: command not found: {{ currentPath }}</p>
    <p class="mt-4 text-sm text-text-muted">这个页面不存在，或者已经被移动到别处。</p>
    <RouterLink
      to="/"
      class="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm transition-colors hover:border-primary/50"
    >
      cd ~ 返回首页
    </RouterLink>
  </section>
</template>
