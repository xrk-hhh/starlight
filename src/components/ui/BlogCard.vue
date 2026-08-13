<script setup lang="ts">
import type { BlogMeta } from '@/lib/blog'

defineProps<{ post: BlogMeta }>()
</script>

<template>
  <RouterLink
    :to="`/blog/${post.slug}`"
    data-reveal
    class="card block p-6 transition-colors hover:border-white/20"
  >
    <time class="font-mono text-xs text-text-muted">{{ post.date }}</time>
    <h3 class="mt-2 text-lg font-semibold">{{ post.title }}</h3>
    <p class="mt-2 line-clamp-2 text-sm text-text-muted">{{ post.desc }}</p>
    <ul class="mt-4 flex gap-2">
      <li v-for="tag in post.tags" :key="tag" class="text-xs text-primary">#{{ tag }}</li>
    </ul>
  </RouterLink>
</template>
