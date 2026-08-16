<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

// 星港电台（v1.10）：首页背景音乐按钮——纯音乐 Ethereal Relaxation（Kevin MacLeod, CC BY 4.0）。
// 点击播放/暂停：播放时唱片旋转、均衡器律动、光环呼吸；首次点击才加载音频（preload none）。
// 浏览器禁止自动播放，因此不记忆播放状态；离开首页组件卸载即停。
const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const loading = ref(false)
const SHOW_PILL = ref(false)

const TRACK_SRC = `${import.meta.env.BASE_URL}audio/starlight-theme.mp3`

async function toggle() {
  const el = audioEl.value
  if (!el) return
  if (playing.value) {
    el.pause()
    playing.value = false
    return
  }
  loading.value = true
  try {
    el.volume = 0.45
    await el.play()
    playing.value = true
  } catch {
    /* 自动播放策略或解码失败：静默保持暂停态 */
  }
  loading.value = false
}

onUnmounted(() => audioEl.value?.pause())
</script>

<template>
  <div
    class="group fixed bottom-6 left-6 z-[55] flex items-center"
    @mouseenter="SHOW_PILL = true"
    @mouseleave="SHOW_PILL = false"
  >
    <audio ref="audioEl" :src="TRACK_SRC" loop preload="none"></audio>

    <!-- 唱片按钮本体 -->
    <button
      type="button"
      :aria-label="playing ? '暂停背景音乐' : '播放背景音乐'"
      :title="playing ? '暂停星港电台' : '播放星港电台'"
      class="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-surface/80 shadow-lg shadow-black/40 backdrop-blur transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
      @click="toggle"
    >
      <!-- 播放时呼吸光环 -->
      <span
        v-if="playing"
        aria-hidden="true"
        class="absolute -inset-1 animate-ping rounded-full border border-primary/25 [animation-duration:2.4s]"
      ></span>
      <!-- 黑胶唱片：同心沟纹 conic 渐变，播放时旋转 -->
      <span
        aria-hidden="true"
        class="vinyl relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
        :class="{ spinning: playing }"
        :style="{
          background:
            'repeating-radial-gradient(circle at 50% 50%, #16161f 0 2px, #1f1f2c 2px 3px, #16161f 3px 5px)',
        }"
      >
        <!-- 唱片标签：星形中心孔 -->
        <span
          class="flex h-5 w-5 items-center justify-center rounded-full text-[9px] leading-none"
          style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent))"
        >
          <span class="text-white/90">✦</span>
        </span>
      </span>
      <!-- 暂停/加载角标 -->
      <span
        v-if="!playing || loading"
        class="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-bg/90 text-[9px] text-text-muted backdrop-blur"
        aria-hidden="true"
      >
        {{ loading ? '…' : '▶' }}
      </span>
    </button>

    <!-- 悬浮曲目条：唱片名 + 均衡器（hover 或播放中显示） -->
    <Transition name="pill">
      <div
        v-if="SHOW_PILL || playing"
        class="ml-3 flex items-center gap-3 rounded-full border border-white/10 bg-surface/80 py-2 pl-4 pr-5 shadow-lg shadow-black/30 backdrop-blur"
      >
        <span class="flex items-end gap-[3px]" aria-hidden="true">
          <span class="eq-bar" :class="{ dancing: playing }" style="animation-delay: 0s"></span>
          <span class="eq-bar" :class="{ dancing: playing }" style="animation-delay: 0.25s"></span>
          <span class="eq-bar" :class="{ dancing: playing }" style="animation-delay: 0.5s"></span>
          <span class="eq-bar" :class="{ dancing: playing }" style="animation-delay: 0.12s"></span>
        </span>
        <span class="whitespace-nowrap">
          <span class="block font-mono text-[11px] text-primary">星港电台 · 播放中</span>
          <span class="block text-[10px] text-text-muted/70">Ethereal Relaxation — Kevin MacLeod (CC BY 4.0)</span>
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 唱片旋转 */
.vinyl.spinning {
  animation: vinyl-spin 4.5s linear infinite;
}
@keyframes vinyl-spin {
  to {
    transform: rotate(360deg);
  }
}
/* 均衡器：未播放时静止低条，播放时跳动 */
.eq-bar {
  display: block;
  width: 3px;
  height: 5px;
  border-radius: 2px;
  background: color-mix(in oklab, var(--color-primary) 55%, transparent);
  transition: height 0.3s ease;
}
.eq-bar.dancing {
  animation: eq-dance 0.9s ease-in-out infinite alternate;
}
@keyframes eq-dance {
  from {
    height: 4px;
  }
  to {
    height: 16px;
  }
}
/* 曲目条滑入 */
.pill-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pill-leave-active {
  transition: opacity 0.2s ease;
}
.pill-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}
.pill-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .vinyl.spinning,
  .eq-bar.dancing {
    animation: none;
  }
  .eq-bar {
    height: 10px;
  }
}
</style>
