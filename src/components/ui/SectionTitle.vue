<script setup lang="ts">
withDefaults(
  defineProps<{ title: string; subtitle?: string; over?: string; as?: 'h1' | 'h2' }>(),
  { subtitle: '', over: '', as: 'h2' },
)
</script>

<template>
  <div data-reveal class="mb-12">
    <p v-if="over" class="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-text-muted/70">{{ over }}</p>
    <component :is="as" class="text-2xl font-bold md:text-3xl">{{ title }}</component>
    <p v-if="subtitle" class="mt-2 text-sm text-text-muted">{{ subtitle }}</p>
  </div>
</template>
