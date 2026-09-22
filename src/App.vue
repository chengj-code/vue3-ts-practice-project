<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// theme → <html class="dark">：EP 暗色基准与 console 暗色变量都挂在 html.dark 上
// watchEffect 首次也会执行（与 index.html 的 FOUC 脚本重复但幂等），此后 theme 变化自动同步
watchEffect(() => {
  document.documentElement.classList.toggle('dark', appStore.theme === 'dark')
})

// primaryColor → <html style="--brand-color: ...">：
// EP 主色全套与 console-accent 都是它的 color-mix 派生，改这一处全局联动
watchEffect(() => {
  document.documentElement.style.setProperty('--brand-color', appStore.primaryColor)
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView />
  </el-config-provider>
</template>
