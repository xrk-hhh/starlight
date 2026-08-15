<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

// 版本历史属站点元信息（发版时手动维护，最新版本置顶；同步更新 AppFooter 的版本号链接）
const versions = [
  {
    v: 'v1.4.0',
    date: '2026-08',
    note: '趣味交互增强：流星光标/描边标题/划痕转场/惯性卡片/打字流星/版本档案/星系横移',
  },
  {
    v: 'v1.3.0',
    date: '2026-08',
    note: '星空渲染进阶包（星云/分层/流星/排斥场/主星导航）+ 性能修复（预取/进度条）',
  },
  {
    v: 'v1.2.0',
    date: '2026-08',
    note: '视觉质感增强：双语标题/档案行/主星导航/目录行/统计滚动',
  },
  {
    v: 'v1.1.0',
    date: '2026-08',
    note: '内容增强：首页扩版/时间线/打字机/快捷键面板/404彩蛋/giscus/GitHub统计',
  },
  {
    v: 'v1.0.0',
    date: '2026-08',
    note: '首个版本：四页骨架/粒子背景/Hero动画/博客/部署上线',
  },
]

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)
</script>

<template>
  <section ref="scopeRef" class="section-container relative min-h-screen">
    <SectionTitle over="Star Map" title="版本星图" as="h1" />
    <!-- 垂直时间线：复用关于页样式（border-l + pl-6），节点圆点挂在细线上 -->
    <div data-reveal class="relative z-10 space-y-8 border-l border-white/10 pl-6">
      <div v-for="(item, i) in versions" :key="item.v" class="group relative">
        <span
          aria-hidden="true"
          class="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full transition-all duration-200 group-hover:scale-150"
          :class="i === 0 ? 'bg-primary shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-white/20 group-hover:bg-primary/60'"
        ></span>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="font-mono text-primary transition-colors group-hover:text-accent">{{ item.v }}</span>
          <span class="font-mono text-xs text-text-muted">{{ item.date }}</span>
          <span
            v-if="i === 0"
            class="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-primary"
            >● NOW</span
          >
        </div>
        <p class="mt-1.5 text-sm leading-6 text-text-muted">{{ item.note }}</p>
      </div>
    </div>
  </section>
</template>
