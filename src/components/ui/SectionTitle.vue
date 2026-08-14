<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; over?: string }>()
</script>

<template>
  <div data-reveal class="mb-12">
    <p v-if="over" class="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-text-muted/70">{{ over }}</p>
    <h2 class="text-2xl font-bold md:text-3xl">{{ title }}</h2>
    <p v-if="subtitle" class="mt-2 text-sm text-text-muted">{{ subtitle }}</p>
  </div>
</template>
