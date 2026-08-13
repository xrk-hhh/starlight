<script setup lang="ts">
defineProps<{ name: string; level?: '熟练' | '了解' }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm"
    :class="level === '熟练' ? 'border-primary/40 text-primary' : 'text-text-muted'"
  >
    {{ name }}
  </span>
</template>
