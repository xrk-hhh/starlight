<script setup lang="ts">
import { ref } from 'vue'
import { projects } from '@/data/projects'
import ProjectCard from '@/components/ui/ProjectCard.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)
</script>

<template>
  <section ref="scopeRef" class="section-container relative min-h-screen overflow-hidden">
    <div class="relative z-10">
      <SectionTitle over="Projects" title="项目" subtitle="我做过的部分项目" />
    </div>
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-16 z-0 overflow-hidden">
      <div class="marquee-track flex whitespace-nowrap">
        <span class="marquee-item font-mono text-8xl font-bold leading-none text-transparent" style="-webkit-text-stroke: 1px rgba(139,92,246,0.18)">PROJECTS // 作品&nbsp;&nbsp;</span>
        <span class="marquee-item font-mono text-8xl font-bold leading-none text-transparent" style="-webkit-text-stroke: 1px rgba(139,92,246,0.18)">PROJECTS // 作品&nbsp;&nbsp;</span>
      </div>
    </div>
    <div class="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="p in projects" :key="p.slug" :project="p" />
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  animation: marquee 40s linear infinite;
  width: max-content;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
