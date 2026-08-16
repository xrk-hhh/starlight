<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 桌宠 v4（v1.9）：真·原版奶龙（erich207/nailong-codex-pet）与奶蛙（timerring/codex-pet-naiwa）
// 双角色精灵表动画——素材为 Codex v2 桌宠格式的透明背景帧，裁出 4 行并压缩：
// row0 idle(6帧) / row1 waving(4帧) / row2 jumping(5帧) / row3 running(6帧)。
// 交互：拖拽 / 点击说话 / 双击跳跃 / ✕ 收起（sessionStorage）；hover 出现切换按钮选角色。
type Mood = 'idle' | 'poke' | 'dance' | 'drag'
type Char = 'nailong' | 'naiwa'

const ROW_OF: Record<Mood, number> = { idle: 0, poke: 1, dance: 2, drag: 3 }
const FRAMES_OF: Record<Mood, number> = { idle: 6, poke: 4, dance: 5, drag: 6 }

const CHAR_META: Record<Char, { name: string; sheet: string; lines: string[]; hi: string }> = {
  nailong: {
    name: '奶龙',
    sheet: `${import.meta.env.BASE_URL}images/nailong/pet-sheet.webp`,
    hi: '咩吼～ 奶龙前来报到 ✦',
    lines: [
      '咩吼～',
      '奶龙前来报到 ✦',
      '拖我去星港任何角落～',
      '哈哈哈（拍桌',
      '听说按 ? 有惊喜',
      '别戳啦，会掉毛的！',
      '正在探测附近的零食…',
      '星光今晚很亮呀',
    ],
  },
  naiwa: {
    name: '奶蛙',
    sheet: `${import.meta.env.BASE_URL}images/naiwa/pet-sheet.webp`,
    hi: '呱！奶蛙巡航中 ✦',
    lines: [
      '呱！',
      '奶蛙前来换班～',
      '蛙蛙目光坚定（并不',
      '今天的代码也要呱呱叫',
      '听说按 ? 有惊喜',
      '别戳啦，会跳走的！',
      '正在探测附近的蚊子…',
      '呱呱呱（摩斯密码',
    ],
  },
}

const DISPLAY_W = 140
// 源帧 119×129（按 0.62 缩放后的精灵表），显示高度按比例换算
const FRAME_H = Math.round((DISPLAY_W * 129) / 119)
// 视口窄于 1024（lg 以下）时不挂载：固定定位桌宠必然压住正文，且触屏拖拽会拦滚动
const PET_MIN_VIEWPORT = 1024

const char = ref<Char>('nailong')
const mood = ref<Mood>('idle')
const pos = ref({ x: 0, y: 0 })
const dragging = ref(false)
const bubble = ref('')
const hidden = ref(false)
// 性能（v1.10.2）：桌宠整体延迟到 idle 后挂载——不抢首屏渲染与带宽；
// 第二角色精灵表也不再预载，切换时按需拉取（本地/CDN 下几乎无感）
const ready = ref(false)

const sheetUrl = computed(() => CHAR_META[char.value].sheet)
const sheetStyle = computed(() => ({
  width: DISPLAY_W + 'px',
  height: FRAME_H + 'px',
  backgroundImage: `url(${sheetUrl.value})`,
  backgroundSize: `${DISPLAY_W * 8}px ${FRAME_H * 4}px`,
  backgroundPosition: `-${frame.value * DISPLAY_W}px -${ROW_OF[mood.value] * FRAME_H}px`,
}))

// 帧步进：110ms/帧，按当前情绪的帧数循环
const frame = ref(0)
let frameTimer = 0
function startFrameLoop() {
  window.clearInterval(frameTimer)
  frame.value = 0
  frameTimer = window.setInterval(() => {
    frame.value = (frame.value + 1) % FRAMES_OF[mood.value]
  }, 110)
}

function speak(text?: string) {
  const meta = CHAR_META[char.value]
  bubble.value = text ?? meta.lines[Math.floor(Math.random() * meta.lines.length)]
  window.clearTimeout(bubbleTimer)
  bubbleTimer = window.setTimeout(() => (bubble.value = ''), 2600)
}
let bubbleTimer = 0
let moodTimer = 0

function setMood(m: Mood, backMs?: number) {
  window.clearTimeout(moodTimer)
  if (mood.value !== m) {
    mood.value = m
    startFrameLoop()
  }
  if (backMs) {
    moodTimer = window.setTimeout(() => setMood('idle'), backMs)
  }
}

// 角色切换（记忆选择；第二角色精灵表切换时按需加载，不为它预载带宽）
function switchChar() {
  char.value = char.value === 'nailong' ? 'naiwa' : 'nailong'
  try {
    localStorage.setItem('starlight:pet-char', char.value)
  } catch {
    /* storage 不可用时静默 */
  }
  setMood('poke', 2200)
  speak(CHAR_META[char.value].hi)
}

function clampToViewport(x: number, y: number) {
  return {
    x: Math.min(Math.max(8, x), window.innerWidth - DISPLAY_W - 8),
    y: Math.min(Math.max(8, y), window.innerHeight - FRAME_H - 8),
  }
}

let startX = 0
let startY = 0
let startPosX = 0
let startPosY = 0
let moved = 0
function onPointerDown(e: PointerEvent) {
  dragging.value = true
  moved = 0
  startX = e.clientX
  startY = e.clientY
  startPosX = pos.value.x
  startPosY = pos.value.y
  setMood('drag')
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  moved = Math.max(moved, Math.hypot(dx, dy))
  pos.value = clampToViewport(startPosX + dx, startPosY + dy)
}
function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  setMood('idle')
}
// 点击检测挂 click（鼠标/触摸/合成事件都可靠），拖拽后的 click 用 moved 拦下
let lastPokeAt = 0
function onClick() {
  const now = performance.now()
  if (moved >= 6 || now - lastPokeAt < 300) return
  lastPokeAt = now
  setMood('poke', 2200)
  speak()
}
function onDblclick() {
  setMood('dance', 3200)
  speak(char.value === 'nailong' ? '奶龙出击！哈哈哈哈哈' : '呱！起飞！')
}
function hidePet() {
  hidden.value = true
  try {
    sessionStorage.setItem('starlight:nailong-hidden', '1')
  } catch {
    /* storage 不可用时静默 */
  }
}

function onResize() {
  pos.value = clampToViewport(pos.value.x, pos.value.y)
}

onMounted(() => {
  // idle 后再挂载桌宠（首屏渲染不加载精灵表、不启动帧循环）
  const schedule =
    'requestIdleCallback' in window
      ? (fn: () => void) => window.requestIdleCallback(fn, { timeout: 2500 })
      : (fn: () => void) => window.setTimeout(fn, 600)
  schedule(() => {
    if (hidden.value) return // 已被收起则不出现
    if (window.innerWidth < PET_MIN_VIEWPORT) return // 小屏不出场，避免遮挡正文
    try {
      const saved = localStorage.getItem('starlight:pet-char')
      if (saved === 'nailong' || saved === 'naiwa') char.value = saved
      hidden.value = sessionStorage.getItem('starlight:nailong-hidden') === '1'
    } catch {
      /* storage 不可用时静默 */
    }
    ready.value = true
    // 默认停泊左下：音乐按钮（bottom-6 left-6）上方留出一格——右下角会压住项目横移
    // 末卡的链接行（GitHub/在线参观），左侧偏上位置避开主要交互区
    pos.value = clampToViewport(24, window.innerHeight - FRAME_H - 112)
    window.addEventListener('resize', onResize)
    startFrameLoop()
  })
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.clearInterval(frameTimer)
  window.clearTimeout(moodTimer)
  window.clearTimeout(bubbleTimer)
})
</script>

<template>
  <div
    v-if="ready && !hidden"
    class="group fixed z-[60]"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
  >
    <!-- 气泡台词 -->
    <Transition name="bubble">
      <div
        v-if="bubble"
        class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/40 bg-bg/90 px-3 py-1 font-mono text-xs text-primary shadow-[0_0_16px_rgba(34,211,238,0.25)] backdrop-blur"
      >
        {{ bubble }}
      </div>
    </Transition>
    <!-- 控制条：hover 出现（切换角色 / 收起） -->
    <div class="absolute -top-3 right-0 z-10 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <button
        type="button"
        tabindex="-1"
        :aria-label="`切换为${char === 'nailong' ? '奶蛙' : '奶龙'}`"
        :title="`切换为${char === 'nailong' ? '奶蛙' : '奶龙'}`"
        class="flex h-5 items-center gap-1 rounded-full border border-white/15 bg-bg/90 px-2 text-[10px] leading-none text-text-muted backdrop-blur transition-colors hover:text-primary"
        @pointerdown.stop
        @click.stop="switchChar"
      >
        {{ char === 'nailong' ? '🐸 换奶蛙' : '🐉 换奶龙' }}
      </button>
      <button
        type="button"
        tabindex="-1"
        aria-label="收起桌宠"
        class="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-bg/90 text-[10px] leading-none text-text-muted backdrop-blur transition-colors hover:text-text"
        @pointerdown.stop
        @click.stop="hidePet"
      >
        ✕
      </button>
    </div>

    <!-- 精灵表动画：交互事件挂稳定容器（换 mood 不换元素，事件不丢）；
         静止时降透明度让路给被遮挡的正文，hover/拖拽/说话时恢复。
         注意只过渡 transform/opacity——精灵表帧动画靠 background-position
         步进，transition-all 会把每帧变成平滑滑动（闪烁平移的根源） -->
    <div
      class="cursor-grab touch-none select-none drop-shadow-[0_10px_16px_rgba(0,0,0,0.4)] transition-[transform,opacity] duration-200 active:cursor-grabbing group-hover:opacity-100"
      :class="[
        dragging || bubble ? 'opacity-100' : 'opacity-60',
        { 'scale-110': dragging },
      ]"
      :style="sheetStyle"
      role="img"
      :aria-label="`桌宠${CHAR_META[char].name}，可以拖拽玩耍`"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @mouseup="onPointerUp"
      @click="onClick"
      @dblclick="onDblclick"
    ></div>

    <!-- 停泊光晕：脚下的星光 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-2 left-1/2 h-2.5 w-16 -translate-x-1/2 rounded-full bg-primary/25 blur-md transition-opacity duration-300 group-hover:bg-primary/40"
    ></div>
  </div>
</template>

<style scoped>
.bubble-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-leave-active {
  transition: opacity 0.25s ease;
}
.bubble-enter-from {
  opacity: 0;
  transform: translate(-50%, 6px) scale(0.8);
}
.bubble-leave-to {
  opacity: 0;
}
</style>
