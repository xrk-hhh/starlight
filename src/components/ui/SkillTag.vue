<script setup lang="ts">
defineProps<{ name: string; level?: '熟练' | '了解' }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_-6px_var(--color-primary)]"
    :class="
      level === '熟练'
        ? 'border-primary/40 bg-primary/5 text-primary hover:border-primary/70 hover:bg-primary/10'
        : 'border-white/10 text-text-muted hover:border-white/25 hover:text-text'
    "
  >
    {{ name }}
    <span v-if="level" class="font-mono text-[10px] opacity-70">{{ level }}</span>
  </span>
</template>
