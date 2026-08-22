<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { audioLevel } from '@/stores/particles'

// 星港电台（v1.10 起步，v2.12 大修，v2.12.1 根治线上无法起播）：
// 起播策略：点击后【不等网络】立即从渐进流播放（el.play() 必须落在用户激活窗口内，
// 任何 await 网络都会耗尽窗口被 autoplay 策略拒绝——线上首播无声的根因）；
// 同时后台预取整曲 blob，就绪后记录进度无缝换源，第二循环起零网络停顿。
// 沉浸感：WebAudio AnalyserNode 取真频谱——均衡器条为真实电平，低频电平写入 audioLevel
// 供 ParticleScene 的 uAudio uniform 消费（星海随音乐呼吸）；reduced-motion 下跳过 analyser。
// 播放/暂停均做 700ms 音量渐变，避免突兀。
const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const loading = ref(false)
const showPill = ref(false)

const TRACK_SRC = `${import.meta.env.BASE_URL}audio/starlight-theme.mp3`
const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let blobUrl: string | null = null
let prefetching = false
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let freqData: Uint8Array<ArrayBuffer> | null = null
let rafId = 0
let fadeTimer: ReturnType<typeof setInterval> | null = null

// 四段真实电平（0~1）：均衡器条的内联高度
const eq = ref([0, 0, 0, 0])
// analyser 不可用（建链失败/reduced-motion）时均衡器回退 CSS 假动画
const analyserActive = ref(false)

/** 后台预取整曲 blob（不阻塞播放）：就绪后若正在播放则记录进度无缝换源 */
function prefetchBlob() {
  if (blobUrl || prefetching) return
  prefetching = true
  fetch(TRACK_SRC)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status))
      return res.blob()
    })
    .then((blob) => {
      blobUrl = URL.createObjectURL(blob)
      const el = audioEl.value
      // 正在播放渐进流：换到 blob 源并回到原进度（同一元素已获准播放，续播无需新手势）
      if (el && playing.value && el.src !== blobUrl) {
        const t = el.currentTime
        el.src = blobUrl
        el.currentTime = t
        el.volume = 0.45
        void el.play().catch(() => {
          /* 续播被拒（极罕见）：保持暂停态，下次点击从 blob 直连播放 */
        })
      }
    })
    .catch(() => {
      prefetching = false // 失败允许下次重试；渐进流播放不受影响
    })
}

/** 建 WebAudio 链（每元素只能建一次 source；失败静默回退 CSS 假均衡器） */
function ensureAnalyser() {
  if (analyser || reducedMotion || !audioEl.value) return
  try {
    audioCtx = new AudioContext()
    const source = audioCtx.createMediaElementSource(audioEl.value)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.75
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
    freqData = new Uint8Array(analyser.frequencyBinCount)
    analyserActive.value = true
  } catch {
    analyser = null
  }
}

function bandAvg(from: number, to: number): number {
  if (!freqData) return 0
  let sum = 0
  for (let i = from; i < to; i++) sum += freqData[i]
  return sum / (to - from) / 255
}

function analyserLoop() {
  rafId = requestAnimationFrame(analyserLoop)
  if (!analyser || !playing.value) return
  analyser.getByteFrequencyData(freqData!)
  eq.value = [
    Math.min(1, bandAvg(1, 4) * 1.15),
    Math.min(1, bandAvg(4, 10) * 1.3),
    Math.min(1, bandAvg(10, 22) * 1.5),
    Math.min(1, bandAvg(22, 44) * 1.8),
  ]
  // 星海呼吸电平：低频为主 + 一点中频，再指数平滑（上升快、回落慢，呼吸感）
  const raw = eq.value[0] * 0.7 + eq.value[1] * 0.3
  audioLevel.value += (raw - audioLevel.value) * (raw > audioLevel.value ? 0.5 : 0.12)
}

/** 停掉频谱空转循环（暂停/卸载时调用；下次播放重启） */
function stopAnalyserLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  eq.value = [0, 0, 0, 0]
}

/** 音量渐变（不打断播放；到点后回调，用于暂停前淡出） */
function fadeVolume(to: number, done?: () => void) {
  const el = audioEl.value
  if (!el) return
  if (fadeTimer) clearInterval(fadeTimer)
  const from = el.volume
  const steps = 14
  let i = 0
  fadeTimer = setInterval(() => {
    i++
    el.volume = from + ((to - from) * i) / steps
    if (i >= steps) {
      if (fadeTimer) clearInterval(fadeTimer)
      fadeTimer = null
      done?.()
    }
  }, 50) // 14×50ms = 700ms
}

async function toggle() {
  const el = audioEl.value
  if (!el) return
  if (playing.value) {
    playing.value = false
    stopAnalyserLoop()
    fadeVolume(0, () => el.pause())
    // 电平归零：星海停止呼吸
    audioLevel.value = 0
    return
  }
  // 关键：play() 必须在点击手势的激活窗口内同步发起——不做任何 await 网络。
  // 首播走渐进流（缓冲足够撑到 blob 就绪），blob 后台预取完成后无缝换源。
  prefetchBlob()
  ensureAnalyser()
  loading.value = true
  el.volume = 0
  // 关键：play() 必须在点击手势的激活窗口内同步发起——不做任何 await 网络。
  // play() 的 promise 在首帧真正出声时才 resolve（慢网络下可达数秒），
  // 故乐观翻转 playing 让 UI 即时反馈，真失败（autoplay 拒绝/解码错误）再回滚。
  const playP = el.play()
  if (audioCtx?.state === 'suspended') void audioCtx.resume()
  playing.value = true
  fadeVolume(0.45)
  if (!rafId) analyserLoop()
  playP.catch(() => {
    playing.value = false
    stopAnalyserLoop()
    audioLevel.value = 0
    el.pause()
  })
  loading.value = false
}

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (fadeTimer) clearInterval(fadeTimer)
  audioLevel.value = 0
  audioEl.value?.pause()
  if (blobUrl) URL.revokeObjectURL(blobUrl)
  void audioCtx?.close()
})
</script>

<template>
  <div
    class="group fixed bottom-6 left-6 z-[55] flex items-center"
    @mouseenter="showPill = true"
    @mouseleave="showPill = false"
  >
    <audio ref="audioEl" :src="TRACK_SRC" loop preload="none"></audio>

    <!-- 唱片按钮本体 -->
    <button
      type="button"
      :aria-label="playing ? '暂停背景音乐' : '播放背景音乐'"
      :title="playing ? '暂停星港电台' : '播放星港电台'"
      class="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-surface/80 shadow-lg shadow-black/40 backdrop-blur transition-all duration-300 hover:border-primary/60 hover-glow-primary"
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

    <!-- 悬浮曲目条：唱片名 + 真实频谱均衡器（hover 或播放中显示） -->
    <Transition name="pill">
      <div
        v-if="showPill || playing"
        class="ml-3 flex items-center gap-3 rounded-full border border-white/10 bg-surface/80 py-2 pl-4 pr-5 shadow-lg shadow-black/30 backdrop-blur"
      >
        <span class="flex h-4 items-end gap-[3px]" aria-hidden="true">
          <span
            v-for="(lvl, i) in eq"
            :key="i"
            class="eq-bar"
            :class="{ dancing: playing && !analyserActive }"
            :style="{ height: playing ? 3 + lvl * 13 + 'px' : '4px', animationDelay: i * 0.12 + 's' }"
          ></span>
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
/* 均衡器：频谱数据驱动高度（内联 style）；analyser 不可用时回退 CSS 动画 */
.eq-bar {
  display: block;
  width: 3px;
  height: 4px;
  border-radius: 2px;
  background: color-mix(in oklab, var(--color-primary) 55%, transparent);
  transition: height 0.09s linear;
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
