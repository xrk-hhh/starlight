<script setup lang="ts">
import { ref } from 'vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import GiscusComments from '@/components/blog/GiscusComments.vue'
import { useGsapReveal } from '@/composables/useGsapReveal'

const scopeRef = ref<HTMLElement | null>(null)
useGsapReveal(scopeRef)

// 已捕获的深空讯号（v1.7 装饰彩蛋）：风格化系统日志，留言正片在下方 Giscus 区
const capturedSignals = [
  {
    from: '星港主控 AI',
    time: '00:00:07',
    text: '检测到访客接近。已点亮走廊灯光，咖啡机预热中 ☕',
  },
  {
    from: '银河货运工会',
    time: '03:14:15',
    text: '您预定的「灵感」包裹已到货，签收码 √2。逾期将退回深空。',
  },
  {
    from: '未来的你',
    time: '∞',
    text: '代码写完了吗？没写完也没关系，先给现在的自己留句话吧。',
  },
]
</script>

<template>
  <section ref="scopeRef" class="section-container relative min-h-[60vh]">
    <SectionTitle
      over="Guestbook"
      title="星语留言板"
      as="h1"
      subtitle="把想说的话写成光，发往这座星港——它会被永久记录在星图上"
    />

    <!-- 已捕获的深空讯号：终端风格装饰卡 -->
    <div data-reveal class="grid gap-4 md:grid-cols-3">
      <div
        v-for="s in capturedSignals"
        :key="s.from"
        class="card p-5 font-mono transition-all duration-300 hover:-translate-y-1"
      >
        <p class="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-text-muted/50">
          <span class="text-primary/80">◉ {{ s.from }}</span>
          <span>{{ s.time }}</span>
        </p>
        <p class="mt-3 text-sm leading-6 text-text-muted">{{ s.text }}</p>
      </div>
    </div>

    <div class="star-divider my-12" aria-hidden="true"><span>✦</span></div>

    <!-- 正片：Giscus 留言区（GitHub 登录后可发星际弹幕） -->
    <div data-reveal class="mx-auto max-w-2xl text-center">
      <p class="text-sm leading-7 text-text-muted">
        在这里留下你的足迹——一句问候、一个建议、或者一个 bug 🐞。<br />
        留言通过 GitHub Discussions 存储，登录 GitHub 即可发射。
      </p>
    </div>
    <div class="mx-auto max-w-2xl">
      <GiscusComments />
    </div>
  </section>
</template>
