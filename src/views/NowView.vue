<script setup lang="ts">
import { ref } from 'vue'
import { profile } from '@/data/profile'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

// 星港日志（v1.6）：极客文化 Now 页——此刻在做什么 / 读什么 / 学什么 / 下一步
const sections = [
  {
    key: 'doing',
    label: '正在做',
    icon: '✦',
    items: profile.now.doing,
  },
  {
    key: 'reading',
    label: '最近在读',
    icon: '❋',
    items: profile.now.reading,
  },
  {
    key: 'learning',
    label: '正在学',
    icon: '▲',
    items: profile.now.learning,
  },
  {
    key: 'next',
    label: '接下来',
    icon: '→',
    items: profile.now.next,
  },
]
</script>

<template>
  <section ref="scopeRef" class="section-container min-h-[60vh]">
    <SectionTitle over="Now" title="星港日志" as="h1" subtitle="此刻的我，正在做什么" />
    <div class="grid gap-6 md:grid-cols-2">
      <div
        v-for="sec in sections"
        :key="sec.key"
        data-reveal
        class="card p-6 transition-colors hover:border-white/20"
      >
        <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-text-muted/70">
          <span class="text-primary">{{ sec.icon }}</span>
          {{ sec.label }}
        </p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="item in sec.items"
            :key="item"
            class="group flex items-start gap-2.5 text-sm leading-relaxed text-text-muted transition-colors hover:text-text"
          >
            <span
              aria-hidden="true"
              class="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60 transition-all duration-200 group-hover:scale-150 group-hover:bg-primary"
            ></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
    <p data-reveal class="mt-8 text-center font-mono text-xs text-text-muted/50">
      ✦ 本页灵感来自 Now 运动（nownownow.com）· 更新于 {{ profile.quickFacts.find((f) => f.label === 'UPDATED')?.value ?? '最近' }}
    </p>
  </section>
</template>
