<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import SkillTag from '@/components/ui/SkillTag.vue'
import { profile } from '@/data/profile'

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

const introParagraphs = computed(() => profile.introLong.split(/\n\s*\n/))
</script>

<template>
  <section ref="scopeRef" class="section-container min-h-screen">
    <SectionTitle title="关于我" :subtitle="profile.title" />
    <div class="grid gap-10 md:grid-cols-[240px,1fr]">
      <img
        :src="profile.avatar"
        alt="头像"
        class="h-60 w-60 rounded-2xl border border-white/10 object-cover"
        loading="lazy"
      />
      <div>
        <p v-for="(para, i) in introParagraphs" :key="i" data-reveal class="leading-relaxed text-text-muted">
          {{ para }}
        </p>
        <div data-reveal class="mt-6 flex flex-wrap gap-2">
          <SkillTag v-for="s in profile.skills" :key="s.name" :name="s.name" :level="s.level" />
        </div>
        <div data-reveal class="mt-8 flex gap-4">
          <a
            v-for="s in profile.socials"
            :key="s.label"
            :href="s.url"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
          >
            {{ s.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
