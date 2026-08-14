<script setup lang="ts">
import { ref } from 'vue'
import { giscusConfig } from '@/config/giscus'

const loaded = ref(false)
const showHint = ref(false)
const container = ref<HTMLElement | null>(null)

function loadComments() {
  if (loaded.value) return
  if (!giscusConfig.categoryId) {
    showHint.value = true
    return
  }
  loaded.value = true
  const s = document.createElement('script')
  s.src = 'https://giscus.app/client.js'
  s.async = true
  s.crossOrigin = 'anonymous'
  s.setAttribute('data-repo', giscusConfig.repo)
  s.setAttribute('data-repo-id', giscusConfig.repoId)
  s.setAttribute('data-category', giscusConfig.category)
  s.setAttribute('data-category-id', giscusConfig.categoryId)
  s.setAttribute('data-mapping', 'pathname')
  s.setAttribute('data-strict', '0')
  s.setAttribute('data-reactions-enabled', '1')
  s.setAttribute('data-theme', 'dark')
  s.setAttribute('data-lang', 'zh-CN')
  s.setAttribute('data-loading', 'lazy')
  container.value?.appendChild(s)
}
</script>

<template>
  <div class="mt-12 border-t border-white/10 pt-6">
    <button
      v-if="!loaded && !showHint"
      type="button"
      class="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-muted transition-colors hover:text-text"
      @click="loadComments"
    >
      💬 加载评论区（需 GitHub 登录）
    </button>
    <p v-if="showHint" class="text-sm text-text-muted">
      评论区尚未配置（等待站点所有者完成 giscus 设置）
    </p>
    <div v-show="loaded" ref="container"></div>
  </div>
</template>
