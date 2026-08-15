<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import ParticleBackground from '@/components/particles/ParticleBackground.vue'
import AppNav from '@/components/layout/AppNav.vue'
import CommandPalette from '@/components/overlay/CommandPalette.vue'
import StarCursor from '@/components/overlay/StarCursor.vue'
import MeteorTransition from '@/components/overlay/MeteorTransition.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
import NavLoadingBar from '@/components/layout/NavLoadingBar.vue'
import { useKonami } from '@/composables/useKonami'

const konami = ref(false)
useKonami(() => {
  konami.value = true
  setTimeout(() => (konami.value = false), 3000)
})

// footer 是 index.html 里的静态 HTML（首帧即存在，避免 Vue mount 插入的 CLS 伪影）。
// 这里用 click 委托接管其站内链接，保持 SPA 无刷新导航。
const router = useRouter()
function onFooterNav(e: MouseEvent) {
  const target = (e.target as Element | null)?.closest?.('a[data-spa]')
  if (!target) return
  const href = target.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('mailto:')) return
  e.preventDefault()
  const path = href.replace(import.meta.env.BASE_URL, '/')
  if (path !== router.currentRoute.value.path) void router.push(path)
}
onMounted(() => document.addEventListener('click', onFooterNav))
onUnmounted(() => document.removeEventListener('click', onFooterNav))
</script>

<template>
  <div class="relative min-h-screen">
    <ParticleBackground />
    <AppNav />
    <main class="relative z-10">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <CommandPalette />
    <BackToTop />
    <NavLoadingBar />
    <StarCursor />
    <MeteorTransition />
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
.page-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.page-leave-active {
  position: absolute;
  inset-inline: 0;
  top: 0;
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
