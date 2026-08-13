<script setup lang="ts">
import type { Project } from '@/data/projects'

const BASE_URL = import.meta.env.BASE_URL

defineProps<{ project: Project }>()
</script>

<template>
  <article data-reveal class="card group overflow-hidden transition-colors hover:border-white/20">
    <div v-if="project.image" class="aspect-video overflow-hidden bg-surface">
      <img
        :src="`${BASE_URL}projects/${project.image}`"
        :alt="project.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div class="p-6">
      <h3 class="text-lg font-semibold">{{ project.title }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-text-muted">{{ project.description }}</p>
      <ul class="mt-4 flex flex-wrap gap-2">
        <li
          v-for="tag in project.tags"
          :key="tag"
          class="rounded-full border border-white/10 px-3 py-1 text-xs text-text-muted"
        >
          {{ tag }}
        </li>
      </ul>
      <div class="mt-5 flex gap-4 text-sm">
        <a v-if="project.github" :href="project.github" target="_blank" rel="noopener" class="text-primary hover:underline">
          GitHub
        </a>
        <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener" class="text-text-muted hover:underline">
          在线演示
        </a>
      </div>
    </div>
  </article>
</template>
