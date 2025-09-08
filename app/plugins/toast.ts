import { defineNuxtPlugin } from 'nuxt/app'

import Toast from '@/components/ui/Toast.vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 全局注册 Toast 组件
  nuxtApp.vueApp.component('Toast', Toast)
}) 