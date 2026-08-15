<script setup lang="ts">
withDefaults(
  defineProps<{ title: string; subtitle?: string; over?: string; as?: 'h1' | 'h2' }>(),
  { subtitle: '', over: '', as: 'h2' },
)
</script>

<template>
  <div data-reveal class="mb-12">
    <p
      v-if="over"
      class="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-text-muted/70"
    >
      <span class="inline-block h-1.5 w-1.5 rotate-45 bg-gradient-to-br from-primary to-accent"></span>
      {{ over }}
      <span class="ml-1 h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"></span>
    </p>
    <component :is="as" class="text-2xl font-bold md:text-3xl">{{ title }}</component>
    <p v-if="subtitle" class="mt-2 text-sm text-text-muted">{{ subtitle }}</p>
  </div>
</template>
