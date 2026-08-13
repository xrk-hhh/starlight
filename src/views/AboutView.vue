<script setup lang="ts">
import { ref } from 'vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)
</script>

<template>
  <section ref="scopeRef" class="section-container min-h-screen">
    <h2 data-reveal class="text-3xl font-bold">关于</h2>
    <p data-reveal class="mt-4 text-text-muted">占位内容（阶段③填充）</p>
  </section>
</template>
