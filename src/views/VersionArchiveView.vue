<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { SITE_VERSION, SITE_VERSION_DATE } from '@/data/site'

// 版本历史属站点元信息（发版时手动维护，最新版本置顶；同步更新 index.html footer 的版本号链接）
const versions = [
  {
    v: SITE_VERSION,
    date: SITE_VERSION_DATE,
    note: '滚动与同步修复：移除项目轨道滚轮劫持（下滑卡顿真凶）/ 星云标签几何重算（消除重叠）/ 版本号单一源全站同步 / 题解计数实校 31 篇 / Now 学习方向更新（机器学习·智能优化·agent 数模·harness 插件性能）/ 补录 v2.0–v2.2 版本条目（依据代码注释）/ 修复 atom.xml 在 CRLF 行尾下生成 0 篇的构建 bug / v2.9 细节打磨（表格重设计·浅色主题全量适配·标签即时·留言/日志美化·桌宠悬停暂停+投喂粒子+图标控制条）',
  },  {
    v: 'v2.8.0',
    date: '2026-08',
    note: '星云与桌宠双升级：技能星云 v2（刻度环渐入/四芒星顶点/星座装饰环慢旋/hover 轴联动）/ 桌宠 v5（甩出惯性滑行+边缘反弹、🍪 投喂计数、🚶 散步跟随光标、时段问候）/ 关于页简介精简一半 / 全站文案润色（motto·分区副标题·404）',
  },  {
    v: 'v2.7.0',
    date: '2026-08',
    note: '全站创意设计：版本星图页真正的星座可视化（点击星定位）/ Now 页星港终端飞行日志 / 首页 hero 鼠标视差（分层反向纵深）/ 标签页失焦标题彩蛋 / 滚抵星港边缘致谢 toast',
  },  {
    v: 'v2.6.0',
    date: '2026-08',
    note: '知识库质检与阅读升级：35 篇文章全量扫描零断链 / 30 张示意图全过三重布局检查（修复 v2.3 遗留 6 处，含 1 个 XML 损坏）/ 新增格雷码+EXGCD（寒假营第四场）/ 难度星级（列表+文章+今日一题）/ 今日一题（按日期确定性轮换）/ 归档时间线视图 / 桌宠算法冷知识 / 背包序·约瑟夫环·构造环三张新图补入旧文',
  },  {
    v: 'v2.5.0',
    date: '2026-08',
    note: '阅读体验包：相关文章推荐（标签重合度）/ 随机漫游（列表按钮 + 快捷键 r）/ 图片 Lightbox（Esc/点遮罩关闭）/ ←→ 键翻篇 / 文章页语法包 idle 预载（点开秒渲染高亮）',
  },
  {
    v: 'v2.4.0',
    date: '2026-08',
    note: '性能与内容双升级：wasm 清零（shiki JS 引擎）/ RSS 订阅 / sitemap / 算法星图导航页',
  },
  {
    v: 'v2.2.0',
    date: '2026-08',
    note: '博客表格主题化美化：等宽表头 + 主色描边 + 斑马纹 + 行悬停（color-mix 基于主题变量，5 套主题自动适配；v2.9 进一步重设计为居中圆角版）',
  },
  {
    v: 'v2.1.0',
    date: '2026-08',
    note: '阅读长文三件套：文章悬浮目录 TOC（h2 锚点 + scroll-spy 高亮）/ markdown 标题锚点（中文保留转连字符）/ 正文图片懒加载（loading=lazy + decoding=async）',
  },
  {
    v: 'v2.0.0',
    date: '2026-08',
    note: '博客两级标签体系：一级分类（算法竞赛/生活/项目/AI）常驻 + 二级知识点标签按分类出现，几十个标签不再糊成一团',
  },
  {
    v: 'v2.3.0',
    date: '2026-08',
    note: '博客大扩容：算法知识库 33 篇（线段树/KMP/二分全家桶/高精度/倍增分治/二维差分等 19 篇新增）+ 26 张 One Dark 风格自绘配图 / 表格主题化美化（表头·斑马纹·悬停）/ 文章 TOC scroll-spy + 标题锚点 + 图片懒加载 / 代码块复制按钮与语言角标 / 上一篇·下一篇导航 / 阅读进度条 / 桌宠闪烁修复 / 首屏性能保持（主包不增）',
  },
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

// 版本星座（v2.7）：版本沿正弦轨迹排布成一条「星轨」，越新越亮越大；
// hover 显示版本号，点击平滑滚动到下方时间线对应条目
const constellation = versions.map((item, i) => {
  const n = versions.length
  const t = n === 1 ? 0 : i / (n - 1)
  return {
    ...item,
    idx: i,
    x: 40 + t * 560,
    y: 130 + Math.sin(t * Math.PI * 2.2) * 62,
    r: 2.5 + (1 - i / Math.max(1, n - 1)) * 3.2,
    bright: 1 - i / Math.max(1, n) / 1.4,
  }
})
const constellationPath = constellation
  .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
  .join(' ')
const hoverStar = ref<number | null>(null)
function scrollToVersion(i: number) {
  document.getElementById(`ver-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
useGsapReveal(scopeRef)
</script>

<template>
  <section ref="scopeRef" class="section-container relative min-h-[60vh]">
    <SectionTitle over="Star Map" title="版本星图" as="h1" />
    <!-- 版本星座（v2.7）：一条星轨串起所有版本，最新最亮；点击星定位到下方详情 -->
    <svg
      data-reveal
      viewBox="0 0 640 260"
      class="mb-14 w-full select-none"
      role="img"
      aria-label="版本星座图：从 v1.0 到 v2.6 的星轨"
    >
      <!-- 星轨连线 -->
      <path :d="constellationPath" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1.2" stroke-dasharray="3 4" />
      <!-- 版本星 -->
      <g v-for="c in constellation" :key="c.v" class="cursor-pointer" @click="scrollToVersion(c.idx)" @mouseenter="hoverStar = c.idx" @mouseleave="hoverStar = null">
        <circle
:cx="c.x" :cy="c.y" :r="c.r + (hoverStar === c.idx ? 2.5 : 0)" class="transition-all duration-200"
          :fill="c.idx === 0 ? 'var(--color-primary)' : '#e2e8f0'"
          :opacity="0.35 + c.bright * 0.6" />
        <!-- 光晕：最新的几颗 -->
        <circle
v-if="c.idx < 3" :cx="c.x" :cy="c.y" :r="c.r + 5" fill="none"
          :stroke="c.idx === 0 ? 'var(--color-primary)' : '#a5b4fc'"
          :opacity="0.4 - c.idx * 0.1" stroke-width="1" />
        <!-- 版本号标签：首尾与 hover 显示，避免 21 颗全标糊成一团 -->
        <text
v-if="c.idx === 0 || c.idx === versions.length - 1 || hoverStar === c.idx"
          :x="c.x" :y="c.y - c.r - 7" text-anchor="middle"
          class="fill-text-muted font-mono" font-size="11">{{ c.v }}</text>
      </g>
    </svg>
    <!-- 垂直时间线：复用关于页样式（border-l + pl-6），节点圆点挂在细线上 -->
    <div data-reveal class="relative z-10 space-y-8 border-l border-white/10 pl-6">
      <div v-for="(item, i) in versions" :id="`ver-${i}`" :key="item.v" class="group relative scroll-mt-28">
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
