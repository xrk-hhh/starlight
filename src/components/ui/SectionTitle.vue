<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div data-reveal class="mb-12">
    <h2 class="text-3xl font-bold md:text-4xl">{{ title }}</h2>
    <p v-if="subtitle" class="mt-3 text-text-muted">{{ subtitle }}</p>
  </div>
</template>
