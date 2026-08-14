<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import ParticleBackground from '@/components/particles/ParticleBackground.vue'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CommandPalette from '@/components/overlay/CommandPalette.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
import NavLoadingBar from '@/components/layout/NavLoadingBar.vue'
import { useKonami } from '@/composables/useKonami'

const konami = ref(false)
useKonami(() => {
  konami.value = true
  setTimeout(() => (konami.value = false), 3000)
})
</script>

<template>
  <div class="relative min-h-screen">
    <ParticleBackground />
    <AppNav />
    <main class="relative z-10">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <CommandPalette />
    <BackToTop />
    <NavLoadingBar />
    <Transition name="fade">
      <div v-if="konami" class="pointer-events-none fixed bottom-8 left-1/2 z-[70] -translate-x-1/2">
        <p class="glow-text rounded-full border border-primary/40 bg-bg/90 px-5 py-2 text-sm">
          🎮 Konami 彩蛋：代码的隐藏关卡 +1
        </p>
      </div>
    </Transition>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
