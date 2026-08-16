<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import ParticleBackground from '@/components/particles/ParticleBackground.vue'
import AppNav from '@/components/layout/AppNav.vue'
import CommandPalette from '@/components/overlay/CommandPalette.vue'
import StarCursor from '@/components/overlay/StarCursor.vue'
import MeteorTransition from '@/components/overlay/MeteorTransition.vue'
import NailongPet from '@/components/overlay/NailongPet.vue'
import MusicPlayer from '@/components/ui/MusicPlayer.vue'
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

// 首帧高度占位校正（v1.7）：index.html 为 #app 预设了 min-height（防 mount 高度跳变），
// mount 后与每次路由切换后按实际内容校正——占位偏高时不再留下底部大片空白。
// 首页同时把真实高度记入 sessionStorage，供下次首帧占位使用（值不准时跳变很小）。
function settleAppHeight() {
  const app = document.getElementById('app')
  if (!app) return
  if (router.currentRoute.value.path === '/') {
    const h = app.scrollHeight
    if (h > window.innerHeight) {
      try {
        sessionStorage.setItem('starlight:home-h', String(h))
      } catch {
        /* storage 不可用时静默降级 */
      }
    }
  }
  app.style.minHeight = ''
}
onMounted(() => {
  nextTick(() => requestAnimationFrame(settleAppHeight))
  // 图片/字体加载完成后复核一次，保证记录的高度足够准
  window.setTimeout(() => {
    nextTick(() => requestAnimationFrame(settleAppHeight))
  }, 1200)
})
watch(
  () => router.currentRoute.value.path,
  () => nextTick(() => requestAnimationFrame(settleAppHeight)),
)
</script>

<template>
  <!-- 根节点不再 min-h-screen：footer 是 #app 之外的静态元素，撑满视口只会在短内容页
       留下大片空白（v1.7 修复）；页面自身的 min-h 需求由各视图的 section 控制 -->
  <div class="relative">
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
    <NailongPet />
    <MusicPlayer />
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
