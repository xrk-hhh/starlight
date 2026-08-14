<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { useCountUp } from '@/composables/useCountUp'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import SkillTag from '@/components/ui/SkillTag.vue'
import FloatingBadges from '@/components/ui/FloatingBadges.vue'
import { profile } from '@/data/profile'

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

const introParagraphs = computed(() =>
  profile.introLong
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
)

const BASE_URL = import.meta.env.BASE_URL
const stats = ref<{ repos: number; stars: number; updatedAt: string } | null>(null)
const statsRowEl = ref<HTMLElement | null>(null)
const { values } = useCountUp(statsRowEl, () => (stats.value ? [stats.value.repos, stats.value.stars] : []))
onMounted(() => {
  fetch(`${BASE_URL}github-stats.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((v) => (stats.value = v))
})
</script>

<template>
  <section ref="scopeRef" class="section-container relative min-h-screen">
    <SectionTitle over="About" title="关于我" :subtitle="profile.title" />
    <FloatingBadges />
    <div class="relative z-10 grid gap-10 md:grid-cols-[240px,1fr]">
      <img
        :src="profile.avatar"
        :alt="profile.name"
        class="h-60 w-60 rounded-2xl border border-white/10 object-cover"
        loading="lazy"
      />
      <div>
        <p v-for="(para, i) in introParagraphs" :key="i" data-reveal class="leading-relaxed text-text-muted">
          {{ para }}
        </p>
        <div data-reveal class="mt-10 space-y-6 border-l border-white/10 pl-6">
          <div v-for="(item, i) in profile.timeline" :key="i">
            <div class="font-mono text-xs text-primary">{{ item.date }}</div>
            <div class="mt-1 font-semibold">{{ item.title }}</div>
            <div class="mt-1 text-sm text-text-muted">{{ item.desc }}</div>
          </div>
        </div>
        <div data-reveal class="mt-6 flex flex-wrap gap-2">
          <SkillTag v-for="s in profile.skills" :key="s.name" :name="s.name" :level="s.level" />
        </div>
        <div data-reveal class="mt-8 flex gap-4">
          <a
            v-for="s in profile.socials"
            :key="s.label"
            :href="s.url"
            :target="s.url.startsWith('mailto:') ? undefined : '_blank'"
            :rel="s.url.startsWith('mailto:') ? undefined : 'noopener'"
            class="text-primary hover:underline"
          >
            {{ s.label }}
          </a>
        </div>
        <div v-if="stats" ref="statsRowEl" class="mt-10 flex gap-8 border-t border-white/10 pt-6">
          <div class="text-center">
            <p class="text-2xl font-semibold text-text">{{ values[0] ?? stats.repos }}</p>
            <p class="text-xs text-text-muted">公开仓库</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-semibold text-text">{{ values[1] ?? stats.stars }}</p>
            <p class="text-xs text-text-muted">总 Star</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-semibold text-text">{{ stats.updatedAt }}</p>
            <p class="text-xs text-text-muted">数据更新于</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
