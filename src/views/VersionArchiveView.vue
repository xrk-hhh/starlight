<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

// 版本历史属站点元信息（发版时手动维护，最新版本置顶；同步更新 index.html footer 的版本号链接）
const versions = [
  {
    v: 'v1.11.0',
    date: '2026-08',
    note: '交互修复三连：轨道 mousedown 即指针捕获劫持了卡片链接点击（根因）→ 改为位移阈值+window 级拖拽；封面图原生 ghost 拖拽吃掉 mousemove → 禁用；强制吸附与直接滚动互搏 → 交互期解除 snap。桌宠默认位移避开链接区，「在线参观」改站内路由',
  },
  {
    v: 'v1.10.2',
    date: '2026-08',
    note: '性能优化：桌宠延迟到空闲挂载（不抢首屏）/ 第二角色精灵表按需加载 / 导航头像 158KB→2KB / 确认粒子 idle 初始化与 wasm 懒加载不占首屏',
  },
  {
    v: 'v1.10.1',
    date: '2026-08',
    note: '星港电台全局化：音乐按钮悬浮全站各页，切页不断播 / 本站自身入列项目星轨（第 4 个项目，唯一「航行中」）',
  },
  {
    v: 'v1.10.0',
    date: '2026-08',
    note: '星港电台：首页背景音乐按钮（黑胶唱片旋转 + 均衡器律动）· Ethereal Relaxation (Kevin MacLeod, CC BY 4.0)',
  },
  {
    v: 'v1.9.0',
    date: '2026-08',
    note: '真·原版奶龙：Codex 精灵表桌宠（透明背景动画帧）+ 奶蛙双角色一键切换 / 多主题系统（深空星港·落日熔金·极光冰川·月白纸笺·樱庭薄暮）/ 算法星域接入真实数据（洛谷 488 通过 · 牛客 Rating 1635）/ 博客两篇复盘改写为本人通过题目',
  },
  {
    v: 'v1.8.0',
    date: '2026-08',
    note: '原版奶龙：桌宠改用真实表情包 GIF（素材来自开源图库 nailong-memes，点击/双击/拖拽切换表情）/ 三张项目封面更换为真实运行截图 / 博客新增算法与数论复盘两篇 + 文内返回按钮 / 工作流文案更新（deepseek-v4-pro + Claude Code · deepseek harness + flash）/ 日志页改为数模与数竞赛备战 / 技能星云适配',
  },
  {
    v: 'v1.7.2',
    date: '2026-08',
    note: '奶龙进化：手绘 SVG 活体桌宠（眨眼/摆尾/眼神追踪/说话张嘴）/ 三张自绘 SVG 项目封面 / Top 组件滚动进度环 / 算法星域（洛谷·牛客）/ 关于与博客 DeepSeek Harness 工作流详述',
  },
  {
    v: 'v1.7.1',
    date: '2026-08',
    note: '奶龙入驻：可拖拽桌宠（点击说话/双击转圈）/ 导航右上角奶龙头像 / 返回顶部火箭图标 / 友邻轨道收录余诺 · QQ Hamburger · 李伟豪 / footer 文案更新',
  },
  {
    v: 'v1.7.0',
    date: '2026-08',
    note: '星图扩展：底部空白根因修复（首帧高度自适应）/ 项目页原生横移重写 / 贡献星图 / 技能星云 / 友邻星轨 / 星语留言板 / 全站视觉与文案深化',
  },
  {
    v: 'v1.6.0',
    date: '2026-08',
    note: '星港深化：星港日志页 / 星光统计带 / 博客标签筛选与搜索 / 404 倒计时 / 卡片模糊与短页留白修复',
  },
  {
    v: 'v1.5.1',
    date: '2026-08',
    note: '横移遮挡修复（距离公式修正）/ 首帧占位仅限首页 / 视觉系统增强（hover 光晕/焦点环/滚动条）',
  },
  {
    v: 'v1.5.0',
    date: '2026-08',
    note: '性能与稳定：footer 静态化消除 CLS / 移除 content-visibility / 首屏 JS 削减 79%',
  },
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
  <section ref="scopeRef" class="section-container relative min-h-[60vh]">
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
