<script setup lang="ts">
import { computed } from 'vue'

// 技能星云（v1.7）：纯 SVG 六轴雷达图，无第三方依赖。
// 外圈刻度环 + 渐变星云填充 + 顶点星标；载入时从星云中心舒展（CSS，reduced-motion 直出终态）。
interface NebulaAxis {
  label: string
  value: number // 0-100
}

const props = defineProps<{ axes: NebulaAxis[] }>()

const CX = 190
const CY = 160
const R = 104

// 六边形顶点：从正上方开始顺时针
function pointAt(i: number, r: number) {
  const n = props.axes.length || 1
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}
const ringAt = (r: number) => props.axes.map((_, i) => pointAt(i, r)).map((p) => `${p.x},${p.y}`).join(' ')
const rings = [0.25, 0.5, 0.75, 1].map((f) => ringAt(R * f))
const dataPoints = computed(() => props.axes.map((a, i) => pointAt(i, (R * Math.min(100, Math.max(0, a.value))) / 100)))
const dataPolygon = computed(() => dataPoints.value.map((p) => `${p.x},${p.y}`).join(' '))
// 轴标签：顶点外侧 22px，顶部/底部标签再让出一点竖直空间
const labels = computed(() =>
  props.axes.map((a, i) => {
    const p = pointAt(i, R + 24)
    return { ...p, label: a.label, anchor: Math.abs(p.x - CX) < 12 ? 'middle' : p.x > CX ? 'start' : 'end' }
  }),
)
</script>

<template>
  <div data-reveal class="card flex flex-col items-center p-6">
    <svg viewBox="0 0 380 320" class="w-full max-w-[380px]" role="img" aria-label="技能星云雷达图">
      <defs>
        <linearGradient id="nebulaFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee" stop-opacity="0.32" />
          <stop offset="1" stop-color="#8b5cf6" stop-opacity="0.32" />
        </linearGradient>
        <linearGradient id="nebulaStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee" />
          <stop offset="1" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      <!-- 刻度环 -->
      <polygon v-for="(ring, i) in rings" :key="i" :points="ring" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      <!-- 轴线 -->
      <line
        v-for="(a, i) in axes"
        :key="a.label"
        :x1="CX"
        :y1="CY"
        :x2="pointAt(i, R).x"
        :y2="pointAt(i, R).y"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="1"
      />
      <!-- 星云主体：入场从中心舒展 -->
      <g class="nebula-body">
        <polygon :points="dataPolygon" fill="url(#nebulaFill)" stroke="url(#nebulaStroke)" stroke-width="1.5" />
        <circle v-for="(p, i) in dataPoints" :key="i" :cx="p.x" :cy="p.y" r="3" fill="#8b5cf6" class="nebula-node" />
      </g>
      <!-- 轴标签 -->
      <text
        v-for="l in labels"
        :key="l.label"
        :x="l.x"
        :y="l.y + 4"
        :text-anchor="l.anchor"
        class="fill-text-muted font-mono"
        font-size="11"
      >
        {{ l.label }}
      </text>
    </svg>
    <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted/50">Skill Nebula · 技能星云</p>
  </div>
</template>

<style scoped>
.nebula-body {
  transform-box: fill-box;
  transform-origin: center;
  animation: nebula-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes nebula-in {
  from {
    transform: scale(0.55);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.nebula-node {
  filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.8));
}
@media (prefers-reduced-motion: reduce) {
  .nebula-body {
    animation: none;
  }
}
</style>
