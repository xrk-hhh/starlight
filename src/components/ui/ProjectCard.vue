<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Project } from '@/data/projects'
import { useInertiaTilt } from '@/composables/useInertiaTilt'

const BASE_URL = import.meta.env.BASE_URL

defineProps<{ project: Project }>()

// 磁吸惯性：transform 加在 article 上，不干扰卡片内链接/按钮点击
const cardEl = ref<HTMLElement | null>(null)
const { attach } = useInertiaTilt(cardEl)
onMounted(attach)
</script>

<template>
  <article
    ref="cardEl"
    data-reveal
    class="card group relative overflow-hidden transition-colors hover:border-white/20"
  >
    <span
      class="absolute inset-y-0 left-0 z-10 w-[3px]"
      :class="project.status === 'active' ? 'bg-gradient-to-b from-primary to-accent' : 'bg-white/15'"
    ></span>
    <div v-if="project.image" class="relative aspect-video overflow-hidden bg-surface">
      <img
        :src="`${BASE_URL}projects/${project.image}`"
        :alt="project.title"
        width="640"
        height="360"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span
        v-if="project.over"
        class="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80"
        >{{ project.over }}</span
      >
    </div>
    <div class="p-6">
      <h2 class="text-lg font-semibold md:text-xl">{{ project.title }}</h2>
      <p class="mt-2 text-sm leading-6 text-text-muted">{{ project.description }}</p>
      <ul class="mt-4 flex flex-wrap gap-2">
        <li
          v-for="tag in project.tags"
          :key="tag"
          :title="tag"
          class="rounded-full border border-white/10 text-text-muted"
          :class="[
            project.tags.length <= 3 ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]',
            tag.length > 14 ? 'max-w-[10rem] truncate' : '',
          ]"
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
